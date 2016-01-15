chrome.contextMenus.create({
    type: 'normal',
    title: chrome.i18n.getMessage('contextmenu'),
    contexts: ['selection'],
    onclick: info => {
        const t = info.selectionText.trim();
        if (!t.length) return false;
        window.open(`https://chain.btc.com/search/${t}`, '_blank');
    }
});