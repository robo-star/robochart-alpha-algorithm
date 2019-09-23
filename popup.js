'use strict';

(function () {
    class PopupFig extends HTMLElement {
        constructor() {
            // establish prototype chain
            super();

            // attaches shadow tree and returns shadow root reference
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
            const shadow = this.attachShadow({ mode: 'open' });

            // get attribute values from getters
            const title = this.title;
            const src = this.src;

            const modal = document.createElement('div');
            modal.classList.add("modal");
            const close = document.createElement('span');
            close.innerHTML = "&times;";
            close.classList.add("close");
            close.onclick = function () {
                modal.style.display = "none";
                document.onkeydown = null;
            }

            const bigimg = document.createElement('img');
            bigimg.classList.add("modal-content");
            bigimg.src = src;

            const caption = document.createElement('div');
            caption.innerHTML = title

            modal.appendChild(close);
            modal.appendChild(bigimg);
            modal.appendChild(caption);

            const popup = document.createElement('div');
            popup.className = "thumbnail";
            //	  popup.style="width:100%;max-width:300px;border:solid;padding:20px;";
            const img = document.createElement('img');
            img.id = title;
            img.src = src;
            img.alt = title;
            img.style = "width:100%;";//max-width:300px;border:solid;padding:20px;";
            img.onclick = function () {
                modal.style.display = "block";
                document.onkeydown = function (e) {
                    if (e.keyCode == 27) {
                        modal.style.display = "none";
                        document.onkeydown = null;
                    } else {
                        console.log("key: ", e);
                    }
                };
            }
            popup.appendChild(img);
            popup.classList.add("thumbnail");


            //console.log("connected", title)    
            //editableListContainer.appendChild(img);
            //editableListContainer.appendChild(modal);
            document.body.appendChild(modal);
            // appending the container to the shadow DOM
            shadow.appendChild(popup);//editableListContainer);
        }

        // gathering data from element attributes
        get title() {
            return this.getAttribute('title') || '';
        }

        get src() {
            return this.getAttribute('src') || '';
        }
    }

    // let the browser know about the custom element
    customElements.define('popup-fig', PopupFig);
})();