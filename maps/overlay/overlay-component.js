define([
    'knockout',
    'leaflet',
    'compare'
], function(ko,L) {
    'use strict';

    function OverlayComponentVM (params) {
        var _this = this,
            config = params.config,
            searchParams = new URLSearchParams(window.location.search),
            initial = {
                leftMap:    searchParams.get('leftMap') ? searchParams.get('leftMap') : config.initial.leftMap,
                rightMap:   searchParams.get('rightMap') ? searchParams.get('rightMap') : 'OSM',
                latitude:   searchParams.get('lat') ? searchParams.get('lat') : config.initial.latitude,
                longitude:  searchParams.get('lng') ? searchParams.get('lng') : config.initial.longitude,
                zoom:       searchParams.get('zoom') ? searchParams.get('zoom') : config.initial.zoom,
                opacity:    searchParams.get('opacity') ? searchParams.get('opacity') : 1.0
            };

        this.config = config;

        // Leaflet map.
        this.map = L.map('map').setView([initial.latitude, initial.longitude], initial.zoom);

        this.leftOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.rightOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Left and right map layers and map info links.
        this.leftLayers = {};
        this.rightLayers = {};
        this.mapLinks = {};
        config.maps.forEach(function(map){
            _this.mapLinks[map.name]      = map.infoURL;
            _this.leftLayers[map.name]    = L.tileLayer(map.tileURL);
            _this.rightLayers[map.name]   = L.tileLayer(map.tileURL);
        });
        this.leftLayers[initial.leftMap].addTo(this.map);
        this.rightLayers.OSM = this.rightOSM;

        // Slider
        this.map.createPane("left");
        this.map.createPane("right");
        this.compare = L.control.compare([this.leftLayers[initial.leftMap],this.leftOSM],[this.rightOSM]).addTo(this.map);

        // Left select observables.
        this.leftMap = ko.observable(initial.leftMap);
        this.oldLeftMap = this.leftMap();
        this.leftMap.subscribe(function(newValue){
            this.changeLeftLayer(newValue);
        },this);

        // Right select observables.
        this.rightMap = ko.observable('OSM');
        this.oldRightMap = this.rightMap();
        this.rightMap.subscribe(function(newValue){
            this.changeRightLayer(newValue);
        },this);

        // Opacity observable
        this.opacity = new ko.observable(initial.opacity);
        this.leftLayers[initial.leftMap].setOpacity(initial.opacity);
        this.opacity.subscribe(function(newValue){
            var layer = _this.leftLayers[_this.leftMap()];
            layer.setOpacity(newValue);
        });

        // Title
        var title = L.control();
        title.onAdd = function(map) {
            this._div = L.DomUtil.create('div', 'ctl');
            this.update();
            return this._div;
        };
        title.update = function(props) {
            this._div.innerHTML = "<div class='title'>The Time Traveler's <br/>Map of "+_this.config.city+"</div><div class='subtitle'><a href='//www.denverlibrary.org/' target='_blank'>Denver Public Library</a> &bullet; <a href='//digital.denverlibrary.org/' target='_blank'>Digital Collections</a> &bullet; <a href='//digital.denverlibrary.org/digital/search/searchterm/map/field/formatb/mode/exact/conn/and/order/title/ad/asc' target='_blank'>Maps</a></div>";
        };
        title.addTo(this.map);

        // If a right map other than OSM is specified in the URL search, set the observable after Knockout has rendered the HTML template.
        if (initial.rightMap !== 'OSM') {
            setTimeout(function(){
                _this.rightMap(initial.rightMap);
            }, 0);
        }
    }

    OverlayComponentVM.prototype.changeLeftLayer = function (newValue) {
        var map = this.map,
            leftLayers = this.leftLayers;
        this.compare.remove();
        map.removeLayer(leftLayers[this.oldLeftMap]);
        leftLayers[newValue].addTo(map);
        this.compare = L.control.compare([leftLayers[newValue],this.leftOSM],[this.rightOSM]).addTo(map);
        this.oldLeftMap = newValue;
        this.opacity(1)
    };

    OverlayComponentVM.prototype.onClickLeftInfo = function () {
        window.open(this.mapLinks[this.leftMap()], "_blank");
    };

    OverlayComponentVM.prototype.changeRightLayer = function (newValue) {
        var map = this.map,
            leftLayers = this.leftLayers,
            rightLayers = this.rightLayers,
            leftCompare,
            rightCompare = newValue == 'OSM' ? [this.rightOSM] : [rightLayers[newValue],this.rightOSM];
        this.compare.remove();
        // If the old right map was not OSM, then remove the left layer for that map.
        if (this.oldRightMap && this.oldRightMap != 'OSM') {
            map.removeLayer(leftLayers[this.oldRightMap]);
        }
        // If the new right map is OSM, remove the layer for the old right map.
        if (newValue == 'OSM') {
            map.removeLayer(rightLayers[this.oldRightMap]);
        }
        // If the new right map is not OSM, then
        // - add the layer for the new right map, and
        // - remove the left layer for the left map, and
        // - add the left layers for the new right map and the selected left map, in order so that the left map layer overlays the right map layer.
        else {
            // ... add the layer for the new right map,
            rightLayers[newValue].addTo(map);
            map.removeLayer(leftLayers[this.leftMap()]);
            leftLayers[newValue].addTo(map);
            leftLayers[this.leftMap()].addTo(map);
        }
        // The compare will have three layers on the left if the right selection is not OSM:
        // 1. the left selection
        // 2. the right selection, if not OSM
        // 3.
        if (newValue == 'OSM') {
            leftCompare = [leftLayers[this.leftMap()],this.leftOSM];
        }
        else {
            leftCompare = [leftLayers[this.leftMap()],leftLayers[newValue]];
        }

        this.compare = L.control.compare(leftCompare,rightCompare).addTo(map);
        this.oldRightMap = newValue;
    };

    OverlayComponentVM.prototype.onClickRightInfo = function () {
        window.open(this.mapLinks[this.rightMap()], "_blank");
    };

    OverlayComponentVM.prototype.onClickShare = function () {
        var url = window.location.origin + window.location.pathname + '?',
            search = new URLSearchParams(window.location.search);
        if (search.get('_ijt')) {
            url += '_ijt=' + search.get('_ijt') + '&';
        }
        url += 'leftMap=' + encodeURIComponent(this.leftMap());
        url += '&rightMap=' + encodeURIComponent(this.rightMap());
        url += '&opacity=' + this.opacity();
        url += '&lat=' + this.map.getCenter().lat;
        url += '&lng=' + this.map.getCenter().lng;
        url += '&zoom=' + this.map.getZoom();
        window.open("mailto:?subject=Time Traveler's Map of Denver&body="+encodeURIComponent(url));
    };

    return {
        template: { require: 'text!overlay-component.html' },
        viewModel: OverlayComponentVM
    };
});
