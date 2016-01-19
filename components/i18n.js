document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
        var translated = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
        if (el.hasAttribute('data-i18n-attribute')) {
            el.setAttribute(el.getAttribute('data-i18n-attribute'), translated);
        } else {
            el.innerHTML = translated;
        }
    });
});