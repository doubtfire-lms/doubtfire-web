'use strict';

describe('Test SampleApp build', function() {

  var pages = require('./pages');
  var page1 = pages.page1();
  var page2 = pages.page2();

  it('should have two pages which show one image, a font icon, links, a heading and the CSS preprocessor type', function() {
    page1.get();
    expect(browser.getCurrentUrl()).toContain('/');

    expect(page1.heading.getText()).toEqual('This is page 1');
    expect(page1.heading.getCssValue('color')).toEqual('rgba(40, 50, 60, 1)');

    expect(page1.logo.getAttribute('width')).toEqual('300');
    expect(page1.logo.getAttribute('height')).toEqual('250');

    // There should be a cssType, which is a pseudo element containing text
    expect(page1.cssType()).toMatch('CSS Preprocessor: .*');

    expect(page1.linkToPage2.isDisplayed()).toEqual(true);

    // Goto page 2
    page1.linkToPage2.click();
    expect(browser.getCurrentUrl()).toContain('page2');
    expect(page2.heading.getText()).toEqual('This is page 2');

    // If the button width is 83px, it means that the icon font has been loaded
    page2.linkToPage1.getCssValue('width').then(function(value) {
      expect(parseInt(value, 10)).toBeGreaterThan(74);
    });


    // Go back to page 1
    page2.linkToPage1.click();
    expect(browser.getCurrentUrl()).toContain('page1');
    expect(page1.heading.getText()).toEqual('This is page 1');

    // Now verify that the history is working..
    browser.navigate().back();
    expect(browser.getCurrentUrl()).toContain('page2');
    expect(page2.heading.getText()).toEqual('This is page 2');

    browser.navigate().back();
    expect(browser.getCurrentUrl()).toContain('/');
    expect(page1.heading.getText()).toEqual('This is page 1');
  });

});
