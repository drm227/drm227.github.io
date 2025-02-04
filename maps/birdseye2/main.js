require.config({
    paths: {
        knockout:   '//cdnjs.cloudflare.com/ajax/libs/knockout/3.5.0/knockout-min',
        text:       '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text',
        leaflet:    '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet'
    }
});

require(['knockout'], function(ko) {

    // register the Knockout component
    ko.components.register('birdseye-component',{require:'birdseye-component'});

    // read the configuration JSON file
    var city = new URLSearchParams(document.location.search).get('city');
    if (!city) {
        city = "Denver";
    }

    // read the configuration JSON file
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