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

        this.feature = ko.observable({});
        this.isMapVisible = ko.observable(false);
        this.modalButtonLabel = ko.computed(function(){
            return this.isMapVisible() ? 'Show Text & Image' : 'Show '+this.birdseye().map.year+' Map';
        }.bind(this));
        this.map = ko.computed(function(){
            return this.isMapVisible() ? this.birdseye().map : undefined;
        }.bind(this));
    }

    BirdseyeComponentVM.prototype.afterRenderComponent = function (elements,viewModel) {
        viewModel.imageMap = L.map('birdseye',viewModel.birdseye().leaflet.imageMap.options);
        viewModel.changeBirdseye(viewModel.birdseye());

        $('#featureDialog').on('shown.bs.modal',function(){
            viewModel.initializeMap();
        });

        $('#featureDialog').on('hide.bs.modal',function(){
            viewModel.tileMap.remove();
            viewModel.isMapVisible(false);
        });
    };

    BirdseyeComponentVM.prototype.afterRenderMap = function (elements,viewModel) {
        console.log(elements);
    };

    BirdseyeComponentVM.prototype.initializeMap = function () {
        var feature = this.feature(),
            marker;
        this.tileMap = L.map('map',this.birdseye().leaflet.tileMap.options);
        L.tileLayer(this.birdseye().leaflet.tileLayer.url).addTo(this.tileMap);

        marker = L.marker(feature.tileMapLatLng,{title:feature.name});
        marker.addTo(this.tileMap);
        this.tileMap.flyTo(feature.tileMapLatLng,16);
    };

    BirdseyeComponentVM.prototype.changeBirdseye = function (birdseye) {
        var _this = this,
            map = this.imageMap,
            imageOverlay,
            features = this.birdseye().features;

        // Replace the birdseye image layer with a new one for the selected birdseye.
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        imageOverlay = L.imageOverlay(birdseye.leaflet.imageLayer.url,birdseye.leaflet.imageLayer.bounds,birdseye.leaflet.imageLayer.options).addTo(map);
        // This event handler is used to get the lat/lon of points on the birdseye layer for feature markers.
        imageOverlay.on('click',function(e){
            console.log(e.latlng);
        });

        // Add markers for the features of the selected map.
        this.featureMap = {};
        features.forEach(function(feature){
            var marker = L.marker(feature.imageMapLatLng,{title:feature.name});
            marker.addTo(_this.imageMap);
            _this.featureMap[feature.name] = feature;
            marker.on('click',function(e){
                _this.feature(_this.featureMap[e.target.options.title]);
                $('#featureDialog').modal('show');
            });
        });
    };

    BirdseyeComponentVM.prototype.onToggleMap = function () {
        this.isMapVisible(!this.isMapVisible());
        this.tileMap.invalidateSize();
    };

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});
