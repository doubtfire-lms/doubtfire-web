# Getting Started

Setting up the development environment.

1. Get access to doubtfire-api
2. Install node. See [http://nodejs.org/download/] or (brew install node)
3. Install modules
    1. Run `npm install` in project root
    2. Install grunt-cli globally using `npm install -g grunt-cli`
    3. Install bower globally using `npm install -g bower`
4. Use bower to install Angular packages (from .bowerrc and bower.json) `bower install`
5. Install Firefox - used in automated testing
7. Use `grunt watchsvr` to compile, watch and create a webserver or
8. Use `grunt watch` to compile, and watch then run server with `grunt connect:devserver` in separate terminal
7. Open web browser and connect to http://localhost:8000

# Useful resources

* Angular UI Router
    * http://angular-ui.github.io/ui-router/site/#/api/ui.router
    * https://github.com/angular-ui/ui-router
* UI Bootstrap
    * http://angular-ui.github.io/bootstrap/
    * Also Bootstrap: http://getbootstrap.com
* NVD3 charts 
    * Angular component https://cmaurer.github.io/angularjs-nvd3-directives/
    * Other examples https://github.com/cmaurer/angularjs-nvd3-directives/tree/master/examples
    * also D3 and NVD3
