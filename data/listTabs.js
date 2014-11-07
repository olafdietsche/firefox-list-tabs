function createButton(msg, cb) {
    var button = document.createElement('button');
    var text = document.createTextNode(msg);
    button.appendChild(text);
    if (cb)
        button.addEventListener('click', cb);

    return button;
}

function createDeleteButton(cb) {
    return createButton('x', cb);
}

function createDeleteTabButton(id, el) {
    return createDeleteButton(function() {
        self.port.emit('close', id);
        el.parentNode.removeChild(el);
    });
}

function createDeleteHostButton(links, el) {
    return createDeleteButton(function() {
        for (var i = 0; i < links.length; ++i)
            self.port.emit('close', links[i].id);

        el.parentNode.removeChild(el);
    });
}

function createAnchor(title, url, id) {
    var a = document.createElement('a');
    a.setAttribute('href', url);
    var text = document.createTextNode(title);
    a.appendChild(text);
    a.onclick = function() {
        self.port.emit('goto', id);
        return false;
    };

    return a;
}

function addUrlEntry(parent, entry) {
    var a = createAnchor(entry.title, entry.url, entry.id);
    parent.appendChild(a);
    button = createDeleteTabButton(entry.id, parent);
    parent.appendChild(button);
}

function createUrlEntry(entry) {
    var li = document.createElement('li');
    addUrlEntry(li, entry);
    return li;
}

function createUrlList(parent, links) {
    for (var i = 0; i < links.length; ++i) {
        var li = createUrlEntry(links[i]);
        parent.appendChild(li);
    }
}

function createHostEntry(entry) {
    var li = document.createElement('li');
    var img = document.createElement('img');
    img.setAttribute('src', entry.favicon);
    li.appendChild(img);
    if (entry.links.length == 1) {
        addUrlEntry(li, entry.links[0]);
    } else {
        var text = document.createTextNode(entry.host + ', ' + entry.links.length + ' Tabs');
        li.appendChild(text);
        var button = createDeleteHostButton(entry, li);
        li.appendChild(button);
        var ul = document.createElement('ul');
        li.appendChild(ul);
        createUrlList(ul, entry.links);
    }

    return li;
}

function createHostList(parent, hosts) {
    for (var h in hosts) {
        var li = createHostEntry(hosts[h]);
        parent.appendChild(li);
    }
}

function listTabs(hosts, n_tabs) {
    var num_hosts = document.getElementById('num-hosts');
    num_hosts.textContent = Object.keys(hosts).length;
    var num_tabs = document.getElementById('num-tabs');
    num_tabs.textContent = n_tabs;
    var tabs_list = document.getElementById('tabs-list');
    createHostList(tabs_list, hosts);
}

listTabs(self.options.hosts, self.options.num_tabs);
