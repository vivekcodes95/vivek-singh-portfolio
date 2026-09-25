// Cotton cord is drawn along its actual curved centerline, including the knot.
// Three helical strands, fine filaments and crossing shadows provide the texture.
export function createRopeRenderer(canvas){
  const context=canvas.getContext('2d');
  const ratio=Math.min(devicePixelRatio||1,2.5);
  canvas.width=280*ratio;canvas.height=260*ratio;
  const mix=(a,b,t)=>a+(b-a)*t;
  function line(points,offset=0){
    context.beginPath();
    points.forEach((p,i)=>{
      const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
      const dx=after.x-before.x,dy=after.y-before.y,d=Math.hypot(dx,dy)||1;
      const x=p.x-dy/d*offset,y=p.y+dx/d*offset;
      if(i===0)context.moveTo(x,y);else context.lineTo(x,y);
    });
  }
  function stroke(points,width,color,offset=0){
    context.strokeStyle=color;context.lineWidth=width;line(points,offset);context.stroke();
  }
  function cord(points,width,phase=0){
    if(points.length<2)return;
    context.lineCap='round';context.lineJoin='round';
    context.save();context.translate(.7,1.2);stroke(points,width+1.4,'rgba(15,22,18,.13)');context.restore();
    stroke(points,width,'#797d73');
    stroke(points,width*.82,'#b9baac',-.12);
    stroke(points,width*.48,'#e0e0d3',-width*.13);
    let distance=phase;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,segment=Math.hypot(dx,dy);
      if(segment<.01)continue;
      const nx=-dy/segment,ny=dx/segment;
      const pitch=width*1.9;
      for(let strand=0;strand<3;strand++){
        const angle=distance/pitch*Math.PI*2+strand*Math.PI*2/3;
        const next=(distance+segment)/pitch*Math.PI*2+strand*Math.PI*2/3;
        const depth=Math.sin(angle);
        if(depth<-.2)continue;
        const offsetA=Math.cos(angle)*width*.28,offsetB=Math.cos(next)*width*.28;
        const light=.5+.5*depth;
        const r=Math.round(mix(131,234,light)),g=Math.round(mix(138,233,light)),blue=Math.round(mix(125,217,light));
        context.strokeStyle=`rgb(${r},${g},${blue})`;context.lineWidth=width*.32;
        context.beginPath();context.moveTo(a.x+nx*offsetA,a.y+ny*offsetA);context.lineTo(b.x+nx*offsetB,b.y+ny*offsetB);context.stroke();
        // Individual cotton filaments follow the twist rather than a dashed line.
        for(const edge of [-.09,.065]){
          context.strokeStyle=edge<0?'rgba(255,255,240,.48)':'rgba(59,73,60,.23)';context.lineWidth=.22;
          context.beginPath();context.moveTo(a.x+nx*(offsetA+width*edge),a.y+ny*(offsetA+width*edge));context.lineTo(b.x+nx*(offsetB+width*edge),b.y+ny*(offsetB+width*edge));context.stroke();
        }
      }
      distance+=segment;
    }
  }
  function bezier(start,curves){
    let previous=start;const samples=[{x:start[0],y:start[1]}];
    for(const curve of curves){
      const [x1,y1,x2,y2,x3,y3]=curve;
      const steps=Math.ceil((Math.hypot(x1-previous[0],y1-previous[1])+Math.hypot(x2-x1,y2-y1)+Math.hypot(x3-x2,y3-y2))*2);
      for(let i=1;i<=steps;i++){
        const t=i/steps,u=1-t;
        samples.push({x:u*u*u*previous[0]+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,y:u*u*u*previous[1]+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3});
      }
      previous=[x3,y3];
    }
    return samples;
  }
  function smooth(points){
    const result=[points[0]];
    for(let i=0;i<points.length-1;i++){
      const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
      const steps=Math.max(6,Math.ceil(Math.hypot(c.x-b.x,c.y-b.y)*2));
      for(let j=1;j<=steps;j++){
        const t=j/steps,t2=t*t,t3=t2*t;
        result.push({x:.5*(2*b.x+(-a.x+c.x)*t+(2*a.x-5*b.x+4*c.x-d.x)*t2+(-a.x+3*b.x-3*c.x+d.x)*t3),y:.5*(2*b.y+(-a.y+c.y)*t+(2*a.y-5*b.y+4*c.y-d.y)*t2+(-a.y+3*b.y-3*c.y+d.y)*t3)});
      }
    }
    return result;
  }
  // One loose overhand knot: a continuous cord, one loop and a tucked end.
  // The openings stay large enough to read at the actual on-screen size.
  const knotPath=bezier([0,-3],[
    [0,3,6,8,6,13],
    [6,20,-7,22,-8,13],
    [-10,4,-2,0,4,4],
    [11,9,3,13,-2,16],
    [-5,19,-1,22,-1,28]
  ]);
  // Redraw only the crossing bridges, leaving the rest of the loop traceable.
  const upperBridge=bezier([-.8,2.1],[[.7,2.5,2.5,3,4,4]]);
  const middleBridge=bezier([2.2,5.6],[[3.5,7.8,5.1,9.4,5.7,11.4]]);
  const lowerBridge=bezier([-2,16],[[-3.6,17.6,-3.3,19.1,-2.4,21]]);
  return function render(points,cordRanges=null){
    if(!context)return;
    context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,280,260);
    const samples=smooth(points);
    if(cordRanges){
      // Continue the same fibers in front of the arm, leaving fingers above the cord.
      for(const [start,end] of cordRanges){
        const section=[];let distance=0;
        for(let i=1;i<samples.length;i++){
          const a=samples[i-1],b=samples[i],length=Math.hypot(b.x-a.x,b.y-a.y);
          const from=Math.max(start,distance),to=Math.min(end,distance+length);
          if(to>from){
            const pointAt=d=>({x:mix(a.x,b.x,(d-distance)/length),y:mix(a.y,b.y,(d-distance)/length)});
            if(!section.length)section.push(pointAt(from));section.push(pointAt(to));
          }
          distance+=length;if(distance>=end)break;
        }
        cord(section,3.3,start);
      }
      return;
    }
    cord(samples,3.3);
    const tip=points.at(-1),previous=points.at(-2);
    context.save();context.translate(tip.x,tip.y);context.rotate(-Math.atan2(tip.x-previous.x,tip.y-previous.y));
    cord(knotPath,3.3);
    for(const [bridge,phase] of [[upperBridge,39],[middleBridge,9],[lowerBridge,66]]){
      stroke(bridge,4.8,'rgba(22,30,24,.3)');cord(bridge,3.3,phase);
    }
    // A trimmed tail with a few separated fibers, not a tassel.
    for(let i=0;i<5;i++){
      context.strokeStyle=i%2?'#989f8e':'#d8ddcc';context.lineWidth=.35;
      context.beginPath();context.moveTo(-2.1+i*.55,27.7);context.quadraticCurveTo(-2.1+i*.55,28.8,-2.4+i*.65,29.7+(i%3)*.3);context.stroke();
    }
    context.restore();
  };
}
