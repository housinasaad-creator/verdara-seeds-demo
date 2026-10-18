/* Quote page: the same form as the drawer, inline. */
import './layout.js';
import { buildForm } from './quote.js';
buildForm(document.getElementById('qform'), { inline: true });
