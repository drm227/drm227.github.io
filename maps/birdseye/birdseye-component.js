define([
    'knockout','leaflet'
], function(ko,L) {
    'use strict';

    function BirdseyeComponentVM (params) {
        this.config = params.config;

        this.birdseye = ko.observable(this.config.birdseyes[0]);
        this.birdseye.subscribe(function(newValue){
            this.changeBirdseye(newValue);
        }.bind(this));

        this.features = ko.computed(function(){
            return this.birdseye().features;
        }.bind(this));
        this.feature = ko.observable();
        this.feature.subscribe(function(newValue){
            this.moveTo(newValue);
        }.bind(this));
    }

    BirdseyeComponentVM.prototype.afterRenderMap = function (elements,viewModel) {
        var leaflet = viewModel.birdseye().leaflet;

        viewModel.tileMap = L.map('map',leaflet.tileMap.options);
        L.tileLayer(leaflet.tileLayer.url).addTo(viewModel.tileMap);

        viewModel.imageMap = L.map('birdseye',leaflet.imageMap.options);
        L.imageOverlay(leaflet.imageLayer.url,leaflet.imageLayer.bounds,leaflet.imageLayer.options).addTo(viewModel.imageMap);
    };

    BirdseyeComponentVM.prototype.changeBirdseye = function (birdseye) {
        var map = this.imageMap,
            imageOverlay,
            tileOverlay;

        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        imageOverlay = L.imageOverlay(birdseye.leaflet.imageLayer.url,birdseye.leaflet.imageLayer.bounds,birdseye.leaflet.imageLayer.options).addTo(map);
        imageOverlay.on('click',function(e){
            console.log(e.latlng);
        });

        map = this.tileMap;
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        tileOverlay = L.tileLayer(birdseye.leaflet.tileLayer.url,{interactive:true}).addTo(map);
        tileOverlay.on('click',function(e){
            console.log(e.latlng);
        });
        map.setMinZoom(birdseye.leaflet.tileMap.options.minZoom);

        this.moveTo();
    };

    BirdseyeComponentVM.prototype.moveTo = function(feature) {
        var leaflet = this.birdseye().leaflet;
        if (feature) {
            this.imageMap.flyTo(feature.imageMapLatLng,16);
            this.tileMap.flyTo(feature.tileMapLatLng,17);
        }
        else {
            this.imageMap.setView(leaflet.imageMap.options.center,leaflet.imageMap.options.zoom);
            this.tileMap.setView(leaflet.tileMap.options.center,leaflet.tileMap.options.zoom);
        }
    };

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});
