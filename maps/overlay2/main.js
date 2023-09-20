require.config({
    paths: {
        jquery:     'https://code.jquery.com/jquery-3.5.1.min',
        knockout:   '//cdnjs.cloudflare.com/ajax/libs/knockout/3.5.0/knockout-min',
        text:       '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text',
        leaflet:    '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet',
        compare:    '//unpkg.com/leaflet-compare/dist/leaflet-compare'
    },
    shim: {
        compare: ['leaflet']
    }
});

require(['jquery', 'knockout'], function($,ko) {

    // register the Knockout component
    ko.components.register('overlay-component',{require:'overlay-component'});

    // read the configuration JSON file
    var city = new URLSearchParams(document.location.search).get('city');
    if (!city) {
        city = "Denver";
    }
    $.ajax({
        url: city + '.json',
        method: 'GET',
        dataType: 'json'
    })
        .done(function(config){
            ko.applyBindings({config:config});
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            alert(jqXHR.status + ' - ' + errorThrown);
        });

    // For debugging, put a reference to the Knockout module in the global namespace.
    window.ko = ko;
});