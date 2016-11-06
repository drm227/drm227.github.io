require.config({
    paths: {
        knockout:   '//cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min',
        text:       '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text'
    }
});

require(['knockout'], function(ko) {
    'use strict';

    ko.components.register('search',{require:'components/search'});

    function MainViewModel () {
        var hashPage = window.location.hash ? window.location.hash.substr(1).split('/')[0] : 'search';
        this.page = ko.observable(hashPage);
    }

    var viewModel = new MainViewModel();
    ko.applyBindings(viewModel);

    // Change page observable when location hash changes (routing)
    $(window).on('hashchange', null,
        function () {
            var hashPage = window.location.hash.substr(1).split('/')[0];
            viewModel.page(hashPage);
        }
    );

    // For debugging, put a reference to the Knockout module in the global namespace.
    window.ko = ko;
});