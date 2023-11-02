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
    }

    BirdseyeComponentVM.prototype.afterRenderMap = function (elements,viewModel) {
        var leaflet = viewModel.birdseye().leaflet;

        viewModel.imageMap = L.map('birdseye',leaflet.imageMap.options);
        L.imageOverlay(leaflet.imageLayer.url,leaflet.imageLayer.bounds,leaflet.imageLayer.options).addTo(viewModel.imageMap);

        viewModel.featureMap = {};
        viewModel.features().forEach(function(feature){
            var marker = L.marker(feature.imageMapLatLng,{title:feature.name});
            marker.addTo(viewModel.imageMap);
            viewModel.featureMap[feature.name] = feature;
            marker.on('click',function(e){
                viewModel.feature(viewModel.featureMap[e.target.options.title]);
                $('#featureDialog').modal('show');
            });
        })
    };

    BirdseyeComponentVM.prototype.changeBirdseye = function (birdseye) {
        var _this = this,
            map = this.imageMap,
            features = this.birdseye().features;

        // Replace the birdseye image layer with a new one for the selected birdseye.
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        L.imageOverlay(birdseye.leaflet.imageLayer.url,birdseye.leaflet.imageLayer.bounds,birdseye.leaflet.imageLayer.options).addTo(map);

        // Add markers for the features of the selected map.
        features.forEach(function(feature){
            var marker = L.marker(feature.imageMapLatLng,{title:feature.name});
            marker.addTo(_this.imageMap);
            _this.featureMap[feature.name] = feature;
            marker.on('click',function(e){
                _this.feature(_this.featureMap[e.target.options.title]);
                $('#featureDialog').modal('show');
            });
        });
    }

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});
