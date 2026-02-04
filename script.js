let allItems = document.querySelectorAll('.grid-column img, .grid-column .iframe-wrapper, .grid-column .text-block');

// I use functino(), not => {} because its easier more me to read, I don't know will you think its a old style?
allItems.forEach(function (item) {
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
    if (item.tagName === 'IMG') {
      bgImg.innerHTML = '<img src="' + item.src + '" alt="">';
    }
    else if (item.classList.contains('iframe-wrapper')) {
      let iframeEle = item.querySelector('iframe');
      bgImg.innerHTML = '<iframe src="' + iframeEle.src + '" frameborder="0"></iframe>';
    }
    else if (item.tagName === 'P') {
      bgImg.innerHTML = '<p>' + item.textContent + '</p>';
      bgImg.classList.toggle('is-active-text');
    }
    bgImg.classList.toggle('is-active');
  });

})




