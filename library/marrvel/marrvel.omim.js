/**
 * plugin for fetching OMIM data from MARRVEL
 */


module.exports = new function() {

    /** variables **/
    this.id = 'marrvel.omim';
    this.title = 'Phenotypes and variants';
    this.subtitle = 'OMIM annotations';
    this.tags = ['human', 'gene', 'disease', 'phenotypes', 'diseases', 'alleles', 'mutations'];

    /** accompanying resources **/
    this.logo = 'marrvel1.2.png';
    this.info = 'marrvel-info.html';

    // urls for API and external pages
    let api_url = 'http://marrvel.org/data/OMIM?geneSymbol=';
    let gene_url = 'http://marrvel.org/search/gene/';
    let omim_url = 'https://www.omim.org/entry/';

    /** signal whether or not plugin can process a query **/
    this.claim = function(query) {
        query = query.trim();
        if (query.length<2 || query.length>30) return 0;
        if (query.split(' ').length !== 1) return 0;
        if (query.split("-").length > 2) return 0;
        let words = query.split(':');
        if (words.length === 1) return 0.8;
        return 0.5;
    };

    /** construct a url for an API call **/
    this.url = function(query, index) {
        return api_url + query.trim()
    };

    /** (helpers) arrange info from raw object into tables **/
    this.makeDescription = function(data) {
        let mimNum = data['mimNumber'];
        let mimTitle = data['title'];
        let mim_url = '<a href="' + omim_url + mimNum + '" target="_blank">' + mimTitle + '</a>';
        let data_phens = data["phenotypes"];
        let phenotypes = [];
        if (data_phens !== undefined) {
            phenotypes = data_phens.map((row) => {
                let temp_url = omim_url + row['phenotypeMimNumber'];
                return '<a href="' + temp_url + '" target="_blank">' + row["phenotype"] + '</a>';
            });
        }
        let data_variants = data["allelicVariants"];
        let mutations = [];
        if (data_variants !== undefined) {
            mutations = data_variants.map((row) => {
                return row['mutations'];
            });
        }
        return [
            ['', ''],
            ['Title', mim_url],
            ['Description', data['description']],
            ['Phenotypes (diseases)', phenotypes.join('<br/>')],
            ['Known alleles (mutations)', mutations.join('<br/>')]
        ];
    };

    /** transform a raw result from an API call into a second query or a display object **/
    this.process = function(data, index) {
        let raw = JSON.parse(data);
        if (raw["message"] !== undefined) {
            return { status: 0, data: "No results" };
        }
        let result = this.makeDescription(raw);
        return { status: 1, data: [result] };
    };

    /** construct a URL to an external information page **/
    this.external = function(query, index) {
        return gene_url + query.trim();
    };
}();