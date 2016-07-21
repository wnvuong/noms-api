var Yelp = require('yelp');
const secretProperties = require('../../secretProperties');

var yelp = new Yelp({
  consumer_key: secretProperties.YELP_CONSUMER_KEY,
  consumer_secret: secretProperties.YELP_CONSUMER_SECRET,
  token: secretProperties.YELP_TOKEN,
  token_secret: secretProperties.YELP_TOKEN_SECRET
});

module.exports.restaurants = {
  handler: function (request, reply) {

    const options = {
      category_filter: 'restaurants',
      location: 'richmond, va'
    };
    yelp.search(options)
    .then(function(data) {

      var restaurants = data.businesses.map(function(orig, index) {

        var simplified = {};

        simplified.name = orig.name;
        simplified.rating = orig.rating;

        return simplified;
      });

      return reply({
        status: 'success',
        results: restaurants
      });
    })
    .catch(function(err) {

      return reply({
        status: 'failure',
        results: err
      });
    })
  },
  description: 'Get nearest restaurants',
  tags: ['api']
}
