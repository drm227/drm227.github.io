require.config({
    paths: {
        knockout:   '//cdnjs.cloudflare.com/ajax/libs/knockout/3.5.0/knockout-min',
        text:       '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text',
        leaflet:    '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet',
        iiif:       '//unpkg.com/leaflet-iiif@1.1.1/leaflet-iiif'
    },
    shim: {
        iiif: ['leaflet']
    }
});

require(['knockout'], function(ko) {

    // register the Knockout component
    ko.components.register('birdseye-component',{require:'birdseye-component'});

    // read the configuration JSON file
    var city = new URLSearchParams(document.location.search).get('city');
    if (!city) {
        city = "Boston";
    }
    document.title = "Bird's Eye View of " + city + " History"
    $.ajax({
        url: city + '.json',
        method: 'GET',
        dataType: 'json'
    })
        .done(function(config){
            ko.applyBindings({config:config});

            config.birdseyes.forEach(function(birdseye){
                birdseye.features.forEach(function(feature){
                    var citation = feature.citations.image;
                    console.log(citation.name+','+citation.url+','+feature.image+','+feature.name+','+birdseye.name);
                });
            });
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            alert(jqXHR.status + ' - ' + errorThrown);
        });

    // For debugging, put a reference to the Knockout module in the global namespace.
    window.ko = ko;
});