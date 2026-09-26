// Replace these clearly marked sample drafts with Vivek's own writing before publishing.
export const profile = { name: 'Vivek Singh', location: 'Born in Uttarakhand', portrait: '/assets/vivek-singh.jpg' };
export const sections = [
  { slug: 'ux-design', name: 'Product Design', icon: 'design', eyebrow: 'People, before pixels', description: 'Notes on how we think, what we notice, and the little decisions that make design feel human.' },
  { slug: 'spatial-design', name: 'Spatial Design', icon: 'space', eyebrow: 'Room to feel at home', description: 'Exploring how thoughtful spaces can bring a little more peace, and a lighter footprint, to everyday life.' },
  { slug: 'photography', name: 'Photography', icon: 'camera', eyebrow: 'A practice of paying attention', description: 'Light, landscapes, and ordinary moments. A space for photographs from my own point of view.' },
  { slug: 'ai-projects', name: 'AI Projects', description: 'Experiments with AI, thoughtful tools, and ideas taking shape.' },
  { slug: 'history', name: 'History', hiddenFromNav: true, icon: 'history', eyebrow: 'Looking back, thinking forward', description: 'Questions about the past, the places that hold it, and the ways it shapes our present.' }
];
export const posts = [
  { slug: 'room-to-think', section: 'ux-design', title: 'A little room to think', subtitle: 'On white space, attention, and knowing what to leave out.', art: 'space', tag: 'User psychology', body: [
    ['Space is part of the conversation', 'An interface speaks through what it leaves open as much as through what it contains. When every element asks for attention, choosing a next step becomes its own task. This draft starts with a simple question: what could we remove without losing meaning?'],
    ['Make the next step legible', 'Consider a reading page. The title, a short introduction, and the article itself can be enough. Related links can wait until the end. This is a design proposition, not a rule: a comparison tool may need density where an essay needs quiet.'],
    ['A question to take into a design review', 'Instead of asking whether a screen looks empty, ask whether someone can find what they came for. Try the page with real content and people, then let their experience challenge the composition.']
  ] },
  { slug: 'familiar-feels-simple', section: 'ux-design', title: 'Why familiar feels simple', subtitle: 'A draft about recognition, patterns, and small moments of trust.', art: 'type', tag: 'Interaction design', body: [
    ['Start with what people bring', 'People arrive with expectations formed elsewhere. A link should look usable. A back action should lead somewhere predictable. Familiarity gives a design a starting point, but it does not excuse keeping a pattern that fails.'],
    ['Novelty with a purpose', 'A gentle hover can invite exploration. A navigation system that must be decoded can get in the way. The useful question is whether a new interaction makes the task clearer or only makes the interface more noticeable.'],
    ['A small experiment', 'Describe an action without naming its button. Ask someone where they would go to complete it. Their first choice is a useful starting point for understanding what the interface communicates.']
  ] },
  { slug: 'kind-empty-states', section: 'ux-design', title: 'An empty state can be kind', subtitle: 'What an interface says when there is nothing to show yet.', art: 'empty', tag: 'Product thinking', body: [
    ['Nothing is still a state', 'A new collection has no entries. A search finds no matches. An upload has not happened yet. These situations deserve different language because they ask different things of the person using the interface.'],
    ['Be specific, then helpful', 'Say what is missing and offer a relevant next step when one exists. If photographs have not been added, say so. A polished placeholder should never imply that a photograph, project, or result already exists.'],
    ['Keep the promise small', 'Sometimes the most useful empty state is a plain sentence. It can explain the situation without inventing urgency, demanding an email address, or turning a quiet moment into a sales pitch.']
  ] },
  { slug: 'landscape-as-archive', section: 'history', title: 'The landscape as an archive', subtitle: 'Questions to ask of paths, places, and the stories around them.', art: 'landscape', tag: 'Places & memory', body: [
    ['Begin with a question', 'A landscape can invite historical questions before it gives answers. Why does a path take this turn? Who named a place? What has changed around a river? These are prompts for investigation, not evidence on their own.'],
    ['Read beyond the view', 'A future essay could bring together maps, archival records, and oral accounts. Each source would need context: who made it, when, for whom, and what it leaves out. A beautiful scene should not substitute for that work.'],
    ['Leave room for uncertainty', 'This is an initial outline for writing about place and memory. Specific historical claims, quotations, and dates will be added only after the supporting sources have been checked.']
  ] },
  { slug: 'reading-a-map', section: 'history', title: 'What a map leaves out', subtitle: 'An outline about borders, perspective, and the act of looking.', art: 'map', tag: 'History & perspective', body: [
    ['A frame is a choice', 'Every map selects what to show. Before reading it as a complete account, it helps to ask what it was made to do. A route map, a political map, and a personal sketch can tell different stories about the same place.'],
    ['Questions for a closer reading', 'Who commissioned this map? Which names does it use? What is emphasized by its scale? A developed version of this draft would compare specific maps and cite the collections that preserve them.'],
    ['The next step', 'Choose a pair of maps with known origins and read them alongside a written source. This draft is a direction for research, not a finished historical argument.']
  ] },
  { slug: 'learning-to-read-the-past', section: 'history', title: 'Learning to read the past', subtitle: 'From collecting dates to asking better questions.', art: 'type', tag: 'Notes on learning', body: [
    ['Beyond a sequence of events', 'A timeline can help orient a reader. It cannot, by itself, explain why something happened or how it was experienced. This draft explores a reading habit: turn each confident statement into a question about its evidence.'],
    ['Keep the source close', 'Separate what a source says from what a later writer concludes. Note the date, author, intended audience, and gaps. These small habits make it easier to revisit an interpretation when new evidence appears.'],
    ['An unfinished notebook', 'The eventual essay will need a concrete historical example and a short reading list. For now, this is an outline of a method rather than an account of a particular event.']
  ] },
  { slug: 'a-home-that-exhales', section: 'spatial-design', title: 'A home that lets you exhale', subtitle: 'Thinking about calmer rooms and the rhythms of daily life.', art: 'room', tag: 'Interior design', body: [
    ['Begin with a day, not an image', 'Before deciding how a room should look, imagine how someone moves through it. Where do they set things down? Where do they rest? A calm space may begin with making those ordinary actions easier.'],
    ['Quiet is personal', 'For one person, quiet means clear surfaces. For another, it means books, texture, and familiar objects. A useful design conversation leaves room for both, instead of treating one visual style as the definition of peace.'],
    ['A starting point', 'Observe one corner of a home for a week. Notice what gathers there and what feels awkward. Make one small change and see whether it supports the way the space is actually used.']
  ] },
  { slug: 'use-what-is-already-here', section: 'spatial-design', title: 'Use what is already here', subtitle: 'A starting point for thinking about sustainability at home.', art: 'material', tag: 'Sustainability', body: [
    ['Take stock first', 'A room can change without replacing everything in it. This draft begins with an inventory: what works, what can be repaired, and what no longer supports daily life?'],
    ['Ask about the whole life', 'A material choice deserves more than a colour comparison. Durability, repair, sourcing, and eventual disposal all belong in the conversation. Specific environmental claims would need product-level evidence rather than a green label.'],
    ['Design for continuing use', 'Think about whether a piece can move with you, serve another purpose, or be repaired locally. These are questions to guide a project, not a claim that every reused item is automatically the best choice.']
  ] },
  { slug: 'light-before-things', section: 'spatial-design', title: 'Light, before more things', subtitle: 'Noticing what changes in a room throughout the day.', art: 'light', tag: 'Everyday spaces', body: [
    ['Watch before you rearrange', 'The same corner can feel different in the morning and late afternoon. Observing a room through the day is a way to understand what is already there before choosing what to add.'],
    ['Design around an activity', 'Reading, cooking, resting, and working ask different things of a space. Start with the activity and the person, then consider where light helps or gets in the way.'],
    ['A simple notebook exercise', 'Record where you prefer to sit at three different times. Note glare, shadows, and comfort. A future version of this essay could build on those observations with drawings and a real room study.']
  ] },
  ...[
    ['tiny-forest-mushrooms', 'Tiny Forest Mushrooms', 'Very small mushrooms growing on a moss-covered tree in Coorg.', 'Forest', 'Coorg, Karnataka', 'Sony α6700 + Sigma 18–50mm f/2.8', '29 Aug 2026', '2026-08-29', '/assets/coorg-tiny-forest-mushrooms.jpg', 'Tiny pale mushrooms growing among vivid green moss on a tree in Coorg', 6192, 3480, 'A Small World After Rain'],
    ['forest-notes', 'Radar or Mushroom?', 'A fallen satellite dish in the forest in Coorg.', 'Woodland', 'Coorg, Karnataka', 'Sony α6700 + Sigma f/1.8', '29 Aug 2026', '2026-08-29', '/assets/coorg-radar-or-mushroom.jpg', 'A fallen parabolic dish among trees and wet leaves in Coorg', 6192, 3480, 'The Forest Found a Signal'],
    ['closer-to-home', 'Crash by the River', 'My drone crashed beside this river in Coorg.', 'Riverside', 'Coorg, Karnataka', 'Sony α6700 + Sigma f/1.8', '29 Aug 2026', '2026-08-29', '/assets/coorg-crash-by-the-river.jpg', 'A crashed drone beside a wooded riverbank in Coorg', 6192, 3480, 'Flight Ended by the Water'],
    ['where-the-hills-begin', 'Mist on the Hills Slips to Meet the Lake', 'Bhimtal Lake, seen from Golu Devta Temple.', 'Landscape', 'Bhimtal, Uttarakhand', 'Google Pixel 9 Pro', '31 Jan 2026', '2026-01-31', '/assets/bhimtal-mist-meets-lake-graded.png', 'Mist hanging over the hills and Bhimtal Lake as seen from Golu Devta Temple', 1088, 1445, 'Where the Mist Comes Down'],
    ['kaza-under-a-thousand-stars', 'Kaza Under a Thousand Stars', 'Stars above the snow-covered mountains of Kaza on a clear April night.', 'Nightscape', 'Kaza, Himachal Pradesh', 'Apple iPhone 15', '15 Apr 2025', '2025-04-15', '/assets/kaza-starry-night.png', 'A star-filled blue night sky above snow-covered mountains in Kaza, Himachal Pradesh', 1343, 1790, 'A Sky Too Full to Sleep'],
    ['rarest-blue-sunset', 'The Rarest Blue Sunset I’ve Seen', 'My first trip with my now-wife. :)', 'Lakeside', 'Zostel Plus, Lonavala', 'Apple iPhone 15', '3 Jan 2025', '2025-01-03', '/assets/lonavala-blue-sunset.png', 'A blue sunset over Pawna Lake, with silhouetted hills and a tree, seen from Zostel Plus in Lonavala', 2079, 2772, 'First trip with my ex girlfriend (now-wife)'],
    ['a-passion-parked-on-my-desk', 'A Passion Parked on My Desk', 'My Sector 40 workspace, where I brought Coco home.', 'Workspace', 'Sector 40, Gurugram', 'Apple iPhone 15', '8 Apr 2025', '2025-04-08', '/assets/gurugram-desk-model-car-grade-01-moody-blue.png', 'A black model Mercedes with glowing headlights on a desk, with a keyboard, monitor, headphones, and plant behind it', 1086, 1448, 'Dreams Parked on the Desk']
  ].map(([slug, title, subtitle, tag, location, camera, clicked, clickedISO, image, alt, width, height, cardTitle]) => ({ slug, title, subtitle, tag, location, camera, clicked, clickedISO, image, alt, width, height, cardTitle, section: 'photography', art: 'photo', body: [] }))
];
