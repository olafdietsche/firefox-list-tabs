var action = require("sdk/ui/button/action");

action.ActionButton({
    id: "list-tabs",
    label: "List Tabs",
    icon: {
        16: "./icon-16.png",
        32: "./icon-32.png",
    },
    onClick: openTabsList
});

function groupTabsByHost(tabs) {
    var hosts = {};
    var re = /:\/\/(.+?)\//;
    for (var i = 0; i < tabs.length; ++i) {
        var url = tabs[i].url;
        var host;
        var m = url.match(re);
        if (m) {
            host = m[1];

            var h = hosts[host] || {
                host: host,
                favicon: 'https://www.google.com/s2/favicons?domain=' + host,
                links: []
            };

            h.links.push({
                title: tabs[i].title,
                url: tabs[i].url,
                id: tabs[i].id,
            });

            hosts[host] = h;
        }
    }

    return hosts;
}

function createIndexedList(tabs) {
    var index = {};
    for (var i = 0; i < tabs.length; ++i) {
        var tab = tabs[i];
        index[tab.id] = tab;
    }

    return index;
}

function raise_tab(tab) {
    var window = tab.window;
    window.activate();
    tab.activate();
}

var tabs_list;

function openTabsList() {
    if (tabs_list) {
        raise_tab(tabs_list);
        return;
    }

    var tabs = require("sdk/tabs");
    var hosts = groupTabsByHost(tabs);
    var index = createIndexedList(tabs);
    var self = require("sdk/self");
    var data = self.data;

    tabs.on('close', function(tab) {
        if (tab == tabs_list)
            tabs_list = undefined;
    });

    tabs.open({
        url: data.url('tabs-list.html'),
        onReady: function(tab) {
            tabs_list = tab;

            var worker = tab.attach({
                contentScriptFile: data.url('listTabs.js'),
                contentScriptOptions: { hosts: hosts, num_tabs: tabs.length - 1 },
            });

            worker.port.on('goto', function(id) {
                raise_tab(index[id]);
            });

            worker.port.on('close', function(id) {
                var tab = index[id];
                if (tab) {
                    tab.close();
                    delete index[id];
                }
            });
        },
    });
}
