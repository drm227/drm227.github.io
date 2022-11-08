define([
    'knockout','leaflet'
], function(ko,L) {
    'use strict';

    /*
     TimelineComponentVM data members:
        birdseye    Leaflet map that displays the bird's eye view for the selected feature
        birdseyes   object that maps birdseye names to birdseye configurations (in config)
        config      configuration from JSON file
        feature     feature option that is currently selected
        features    list of features (in config) for the selected theme
        map         Leaflet map that displays the historic maps for the selected feature
        maps        object that maps historic names to historic maps configurations (in config)
        theme       theme option that is currently selected
    */

    function TimelineComponentVM (params) {
        this.config = params.config;

        this.theme = ko.observable(this.config.themes[0]);

        this.features = ko.computed(function(){
            return this.theme().features;
        }.bind(this));
        this.feature = ko.observable();

        this.birdseyes = {};
        this.config.birdseyes.forEach(function(birdseye){
            this.birdseyes[birdseye.name] = birdseye;
        }.bind(this))

        this.maps = {};
        this.config.maps.forEach(function(map){
            this.maps[map.name] = map;
        }.bind(this))
    }

    TimelineComponentVM.prototype.afterRenderMap = function (elements,viewModel) {
        var birdseye =  viewModel.birdseyes[viewModel.feature().birdseye],
            map = viewModel.maps[viewModel.feature().map];
        // Initialize the Leaflet maps
        viewModel.birdseye = L.map('birdseye',birdseye.leafletMap.options);
        viewModel.map = L.map('map',map.leafletMap.options);
        // Show the initial feature (set by Knockout during applyBindings).
        viewModel.changeFeature(viewModel.feature());
        // Subscribe to feature change events after the Leaflet maps and layers have been initialized.
        viewModel.feature.subscribe(function(newValue){
            viewModel.changeFeature(newValue);
        }.bind(this));
    };

    TimelineComponentVM.prototype.changeFeature = function (feature) {
        var _this = this,
            birdseye =  this.birdseyes[feature.birdseye],
            map = this.maps[feature.map];
        // If
        // Replace the Leaflet layer for the birdseye and zoom to the feature
        this.birdseye.eachLayer(function (layer) {
            _this.birdseye.removeLayer(layer);
        });
        L.imageOverlay(birdseye.leafletLayer.url,birdseye.leafletLayer.bounds,birdseye.leafletLayer.options).addTo(this.birdseye);
        this.birdseye.setView(feature.birdseyeLatLng,16);
        // Replace the Leaflet layer for the birdseye and zoom to the feature
        this.map.eachLayer(function (layer) {
            _this.map.removeLayer(layer);
        });
        L.tileLayer(map.leafletLayer.url).addTo(this.map);
        this.map.setView(feature.mapLatLng,17);
    };

    return {
        template: { require: 'text!timeline-component.html' },
        viewModel: TimelineComponentVM
    };
});

