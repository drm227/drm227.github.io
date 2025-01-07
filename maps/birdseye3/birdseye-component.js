define([
    'knockout','leaflet','iiif'
], function(ko,L) {
    'use strict';

    function BirdseyeComponentVM (params) {
        var birdseye = params.config.birdseyes.find(function(birdseye){
            return birdseye.name == decodeURI(location.hash).substring(1);
        });
        birdseye = birdseye ? birdseye : params.config.birdseyes[0];

        this.config = params.config;

        this.birdseye = ko.observable(birdseye);
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

        this.buildIndex();
    }

    BirdseyeComponentVM.prototype.afterRenderComponent = function (elements,viewModel) {
        //viewModel.imageMap = L.map('birdseye',viewModel.birdseye().leaflet.imageMap.options);
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
        viewModel.imageMap = L.map('birdseye', {
            center: [0, 0],
            crs: L.CRS.Simple,
            zoom: viewModel.birdseye().leaflet.imageMap.options.zoom,
        });
    };

    BirdseyeComponentVM.prototype.initializeMap = function () {
        var feature = this.feature(),
            marker;
        this.tileMap = L.map('map',this.birdseye().leaflet.tileMap.options);
        L.tileLayer(this.birdseye().leaflet.tileLayer.url,{maxZoom:20,maxNativeZoom:19}).addTo(this.tileMap);

        marker = L.marker(feature.tileMapLatLng,{title:feature.name});
        marker.addTo(this.tileMap);
        this.tileMap.flyTo(feature.tileMapLatLng,17);
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
        imageOverlay = L.tileLayer.iiif(birdseye.leaflet.imageLayer.url).addTo(map);
        map.on('click',function(e){
            console.log(e);
        });
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
        // Set the hash to the name of the birdseye selected.
        location.hash = birdseye.name;
    };

    BirdseyeComponentVM.prototype.onClickInfo = function () {
        window.open(this.birdseye().birdseye.url, "_blank");
    };

    BirdseyeComponentVM.prototype.onToggleMap = function () {
        this.isMapVisible(!this.isMapVisible());
        this.tileMap.invalidateSize();
    };

    BirdseyeComponentVM.prototype.buildIndex = function () {
        var _this = this,
            names = {};
        this.features = [];
        // Add all features from all birdseyes to features array
        this.config.birdseyes.forEach(function(birdseye){
            birdseye.features.forEach(function(feature){
                feature.birdseye = birdseye.name;
                _this.features.push(feature);
            });
        });
        // Sort the features array by name
        this.features.sort(function(left,right){return left.name < right.name ? -1 : 1});
    };

    BirdseyeComponentVM.prototype.onClickIndex = function () {
        $('#indexDialog').modal('show');
    };

    BirdseyeComponentVM.prototype.onClickFeatureBirdseye = function(name,e) {
        var context = ko.contextFor(e.target),
            vm = context.$parent,
            feature = context.$data,
            birdseye;
        if (feature.birdseye != vm.birdseye().name) {
            birdseye = vm.config.birdseyes.find(function (be){
                return be.name == feature.birdseye;
            });
            vm.birdseye(birdseye);
        }
        vm.feature(feature);
        $('#indexDialog').modal('hide');
        $('#featureDialog').modal('show');
        vm.imageMap.setView(feature.imageMapLatLng,16);
    };

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});
