// How it works (/how-it-works/): the system behind one honest number, as a page of its own. The spine,
// the six cards and the Community Signal at the end are lib/how.js's, on the live Signal (the same
// version the rest of the site reads); under reduced motion every card is there and still.
import { startHow } from '/lib/how.js?v=a102d46e32';
import { getSignal } from '/lib/dom.js?v=47be1f2023';

startHow(document.getElementById('how'), getSignal);
