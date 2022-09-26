define([
    'knockout','leaflet'
], function(ko,L) {
    'use strict';

    function BirdseyeComponentVM (params) {
        this.config = params.config;
        this.birdseye = ko.observable(this.config.birdseyes[0]);

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
        L.imageOverlay('1874 Glover.jpg',leaflet.imageLayer.bounds,leaflet.imageLayer.options).addTo(viewModel.imageMap);
    };

    BirdseyeComponentVM.prototype.moveTo = function(feature) {
        if (feature) {
            this.imageMap.setView(feature.imageMapLatLng,16);
            this.tileMap.setView(feature.tileMapLatLng,17);
        }
        else {
            map.setView([39.749771275005315, -104.99320908930397],13);
            birdseye.setView([39.75, -105], 13);
        }
    };

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});
