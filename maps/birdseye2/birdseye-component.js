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
        viewModel.imageMap = L.map('birdseye',viewModel.birdseye().leaflet.imageMap.options);
        viewModel.changeBirdseye(viewModel.birdseye());
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

    return {
        template: { require: 'text!birdseye-component.html' },
        viewModel: BirdseyeComponentVM
    };
});