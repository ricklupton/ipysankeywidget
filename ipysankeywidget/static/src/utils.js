var $ = require('jquery');

module.exports.loadCss = function(href) {
  // install as widget method (i.e. in `extend`), and call in `render`
  href = href || this.model.get('_view_style');

  if(href){
    $('<link/>', {type: 'text/css', rel: 'stylesheet',
                  href: '/' + href + '.css'
                 })
      .appendTo(this.$el);
  }

  return this;
};

