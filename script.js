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

let getBlockHTML = (blockData) => {
  if (!blockData.image && blockData.type !== 'Text') {
    console.log("No image for block:", blockData.title," ", blockData.type, " ", blockData.id, " ", blockData.attachment?.url);
  }
  // Calculate the random position in vertical
  let colSpan = Math.random() < 0.5 ? 3 : 4; // Randomly decide if the block should span 3 or 4 columns
    // Trinary expression，if the random number is less than 0.5, the block will span 3 columns, otherwise it will span 4 columns.
  let maxColStart = 5 - colSpan; // Because I have 5 column in total in each .grid-column, so the max start column is 5 - colSpan
  let colStart = Math.floor(Math.random() * maxColStart + 1); // Randomly decide the start column for the block, and add 1 because the column index starts from 1 in CSS grid.
  let rowstart = Math.floor(Math.random() * 6 + 1); // Randomly decide the start row for the block, and add 1 because the row index starts from 1 in CSS grid.

  // only change CSS variable
  let styleString =
  `--col-start: ${colStart};
   --col-span: ${colSpan};
   --row-start: ${rowstart};`;
  
  let contentHtml = '';

  //1. image block
  if (blockData.type === 'Image' && blockData.image) {
    contentHtml =
      `<div class="image-wrapper" style="${styleString}"> 
        <img src="${blockData.image.large.src}" alt="${blockData.title || 'Are.na block'}"> 
      </div>`
  }
  //2. link 
  else if (blockData.type === 'Link') {
    contentHtml =
      `<div class="link-wrapper" style="${styleString}">
        <a href="${blockData.source.url}" target="_blank">
          <img src="${blockData.image.src}" alt="${blockData.title || 'Are.na block'}"> 
        </a>
      </div>`
  }
  //3. Embed
  else if (blockData.type === 'Embed') {
    contentHtml =
      `<div class="embed-wrapper" style="${styleString};">
        ${blockData.embed.html}
      </div>`
  }
  //4. text block
  else if (blockData.type === 'Text') {
    contentHtml =
      `<div class="text-block" style="${styleString}">
        ${blockData.content.html}
      </div>`
  }
  //5. attachment
  else if (blockData.type === 'Attachment' && blockData.attachment) {
    if (blockData.attachment.content_type === "audio/mpeg" && blockData.image === null) {
      contentHtml =
        `<div class="attachment-wrapper" style="${styleString}; display: flex; align-items: center; justify-content: center;"> 
          <audio src="${blockData.attachment.url}" controls> </audio>
        </div>`
    }
    // I Need to store my attachment url in the data-src attribute of the .attachment-wrapper div, so that I can use it when click the block and show the content in the .bg-img div
    else {
      contentHtml =
        `<div class="attachment-wrapper" style="${styleString}" data-src="${blockData.attachment.url}"> 
          <img src="${blockData.image.src}" alt="${blockData.title || 'Are.na attachment'}"> 
        </div>`
    }
  }
  else {
    return ''; // If the block type is not supported, return an empty string to skip rendering this block.
  }

  return`
  <div class="grid-column">
    ${contentHtml}
  </div>
  `;
}


//--------put the content into the grid layout-------

let layoutBlocks = (blocksData) => {

  let main = document.querySelector('main');
  main.innerHTML = ''; // Clear existing content before adding new blocks.
  
  if (!blocksData.length) return; // If there are no blocks, exit the function.

  let allBlocksHTML = blocksData.map(block => getBlockHTML(block)).join(''); // Generate HTML for all blocks and join them into a single string.
  main.innerHTML = allBlocksHTML;
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
    // let imgInside = item.querySelector('img');
    item.addEventListener("mouseenter", function () {
      let middleText = document.querySelector(".middle-text");
      if (item.classList.contains('image-wrapper')) {
        middleText.textContent = "[Image]";
      }
      else if (item.classList.contains('link-wrapper')) {
        middleText.textContent = "[Link ↗]";
      }
      else if (item.classList.contains('text-block')) {
        middleText.textContent = "[Text]";
      }
      else if (item.classList.contains('attachment-wrapper')) {
        middleText.textContent = "[File]";
      }
      else if (item.classList.contains('embed-wrapper')) {
        middleText.textContent = "[Youtube]";
      }
    })

    item.addEventListener("mouseleave", function () {
      let middleText = document.querySelector(".middle-text");
      middleText.textContent = "hover/click";
    })


    item.addEventListener('click', function () {
      if (item.classList.contains('link-wrapper')) {
        return; //Link box will jump to a new tab web, do need more interaction, so just return when click the link block.
      }

      let currentItem = item;
      console.log('clicked item classList:', item.classList); 
      // hide another items when current item was clicked and the bg-img was be shown
      allItems.forEach(function (otheritem) {
        if (otheritem !== currentItem) {
          otheritem.classList.toggle('hidden');
        }
      })



      // Text block will be different from img and iframe, need to handle separately,cuz I need to change the .bg-img's color and background color and font size
      let bgImg = document.querySelector('.bg-img');
      console.log('bgImg found:', bgImg);

      let imgInside = item.querySelector('.image-wrapper > img');
      if (imgInside) {
        bgImg.innerHTML = '<img src="' + imgInside.src + '" alt="">';
      }
      else if (item.classList.contains('attachment-wrapper')) {
        console.log('attachment, dataset.src:', item.dataset.src);
        let attachmentUrl = item.dataset.src; // Get the URL from the data-src attribute
        bgImg.innerHTML = `<iframe src="${attachmentUrl}" frameborder="0"></iframe>`;
      }
      else if (item.classList.contains('text-block')) {
        bgImg.innerHTML = item.innerHTML;
        bgImg.classList.toggle('is-active-text');
      }
      else if (item.classList.contains('embed-wrapper')) {
        console.log('embed, innerHTML:', item.innerHTML);
        bgImg.innerHTML = item.innerHTML;
      }
      item.classList.toggle('has-cross'); // Add a class to the clicked item to show the cross 
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



