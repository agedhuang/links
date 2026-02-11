let channelSlug = 'time-is-anything-but-linear' // The “slug” is just the end of the URL.
let myUsername = 'cason-huang' // For linking to your profile.
let ownerUsername = 'amanda-guo' // For linking to the channel owner’s profile.


// ——————————————Function to place content on the page——————————————

let placeChannelInfo = (channelData) => {
  let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('.channel-description')
	let channelLink = document.querySelector('#channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = channelData.title
	channelDescription.innerHTML = channelData.description.html
	channelLink.href = `https://www.are.na/${ownerUsername}/${channelSlug}`
}


// --------Handle different type of blocks------
let createBlockElement = (blockData) => {
  let container = document.createElement('div'); //div for every block

  //1. image block
  if (blockData.type === 'Image' && blockData.image) {
    let img = document.createElement('img');
    img.src = blockData.image.large.src;
    img.alt = blockData.title || 'Are.na block';
    container.appendChild(img);
  }
  //2. link 
  else if (blockData.type === 'Link') {
    container.classList.add('iframe-wrapper')
    let iframe = document.createElement('iframe');
    iframe.src = blockData.source.url;
    container.appendChild(iframe);
  }
  //3. Embed
  else if (blockData.type === 'Embed') {
    container.classList.add('iframe-wrapper')
    container.innerHTML = blockData.embed.html;
  }
  //4. text block
  else if (blockData.type === 'Text') {
    container.classList.add('text-block')
    container.innerHTML = blockData.content.html;
  }
  //5. attachment
  else if (blockData.type === 'Attachment' && blockData.file) {
    container.classList.add('iframe-wrapper')
    let iframe = document.createElement('iframe');
    iframe.src = blockData.attachment.url;
    container.appendChild(iframe);
  }

  return container;
}



//--------put the content into the grid layout-------
let layoutBlocks = (blocksData) => {

  let main = document.querySelector('main');
  main.innerHTML = ''; // Clear existing content before adding new blocks.
  
  if (!blocksData.length) return; // If there are no blocks, exit the function.

  blocksData.forEach((blockData) => {
    let el = createBlockElement(blockData);
    
    // Detect If element have no children or is empty, skip the function
    if (!el.hasChildNodes() || el.innerHTML.trim() === '') return;

    // Every new block will be put into a column
    let newCol = document.createElement('div');
    newCol.classList.add('grid-column');
    
    let colSpan = Math.random() < 0.5 ? 3 : 4; // Randomly decide if the block should span 3 or 4 columns
    // Trinary expression，if the random number is less than 0.5, the block will span 3 columns, otherwise it will span 4 columns.

    let maxColStart = 5 - colSpan; // Because I have 5 column in total in each .grid-column, so the max start column is 5 - colSpan
    let colStart = Math.floor(Math.random() * maxColStart + 1); // Randomly decide the start column for the block, and add 1 because the column index starts from 1 in CSS grid.

    let rowstart = Math.floor(Math.random() * 6 + 1); // Randomly decide the start row for the block, and add 1 because the row index starts from 1 in CSS grid.

    el.style.gridColumnStart = colStart;
    el.style.gridColumnEnd = `span ${colSpan}`;
    el.style.gridRowStart = rowstart;

    // Put them in the colmn and put the column in the main
    newCol.appendChild(el);
    main.appendChild(newCol);
  });
  
  // Re-bind interactions because elements are new!
  initInteractions();

}  









// ——————————————————get data from API ——————————————————————
let fetchJson = (url, callback) => {
	fetch(url, { cache: 'no-store' })
		.then((response) => response.json())
    .then((json) => callback(json))
}

// More on `fetch`:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch



// Now that we have said all the things we *can* do, go get the channel data:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}`, (json) => {
	console.log(json) // Always good to check your response!

	placeChannelInfo(json) // Pass all the data to the first function, above.
})

// And the data for the blocks:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}/contents?per=100&sort=position_desc`, (json) => {
	console.log("Blocks data:", json) // See what we get back.

	layoutBlocks(json.data) // since I need to group the blocks by each page, 5 blocks for each page, I can't do the foreach() loop here.
})



// -————————————————interaction part of Code——————————————————————

function initInteractions() {
  const allItems = document.querySelectorAll('.grid-column > *');
  allItems.forEach(function (item) {
    let imgInside = item.querySelector('img');
    item.addEventListener("mouseenter", function () {
      let middleText = document.querySelector(".middle-text");
      if (imgInside) {
        middleText.textContent = "[Image]";
      }
      else if (item.classList.contains('iframe-wrapper')) {
        middleText.textContent = "[Link]";
      }
      else if (item.classList.contains('text-block')) {
        middleText.textContent = "[Text]";
      }
    })

    item.addEventListener("mouseleave", function () {
      let middleText = document.querySelector(".middle-text");
      middleText.textContent = "hover/click";
    })


    item.addEventListener('click', function () {
      let currentItem = item;

      // hide another items when current item was clicked and the bg-img was be shown
      allItems.forEach(function (otheritem) {
        if (otheritem !== currentItem) {
          otheritem.classList.toggle('hidden');
        }
        else if (otheritem === currentItem) {
          otheritem.style.zIndex = '2';
        }
      })

      // Text block will be different from img and iframe, need to handle separately,cuz I need to change the .bg-img's color and background color and font size
      let bgImg = document.querySelector('.bg-img');

      let imgInside = item.querySelector('img');
      if (imgInside) {
        bgImg.innerHTML = '<img src="' + imgInside.src + '" alt="">';
      }
      else if (item.classList.contains('iframe-wrapper')) {
        let iframeEle = item.querySelector('iframe');
        bgImg.innerHTML = '<iframe src="' + iframeEle.src + '" frameborder="0"></iframe>';
      }
      else if (item.classList.contains('text-block')) {
        bgImg.innerHTML = item.innerHTML;
        bgImg.classList.toggle('is-active-text');
      }
      bgImg.classList.toggle('is-active');
    });


  })

  // show and hide channel description when click the button
  let button = document.querySelector('.button');
  let dri = document.querySelector('.channel-description');

  if (button) {
    button.addEventListener('click', () => {
      console.log("Button clicked!"); 
      button.classList.toggle('button-rotate');
      dri.classList.toggle('channel-description-show'); 
    })
  }
}



