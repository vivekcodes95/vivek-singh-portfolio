// Restore the palette before first paint.
try{const saved=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=['day','night','rain'].includes(saved)?saved:'day';}
catch{document.documentElement.dataset.theme='day';}
