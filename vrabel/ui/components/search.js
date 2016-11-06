define([
    'knockout'
], function(ko) {
    'use strict';

    function SearchViewModel () {

    }

    return {
        template: { require: 'text!components/search.html' },
        viewModel: SearchViewModel
    };
});
