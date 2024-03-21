const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get("/", (req, res, next) => {
  Product.find()
      .select('name price _id') // All the items i want to select
      // .select('-__v')    alternative way, if i want to exclude i can use this
      .exec()
      .then( docs => {
          const response = {
              count: docs.length,
              products: docs.map(({ _id, name, price }) => {
                  return {
                      name, price, _id,
                      request: {
                          type: 'GET',
                          url: 'http://localhost:3000/products/' + _id
                      }
                  }
              })
          };
          res.status(200).json(response);
      })
      .catch(err => {
          console.log(err);
          // Sometimes it doesn't want me to add this response here for some reason,
          // if there is an error i just comment it out
          res.status(500).json({
              error: err
          });
      });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }

            }
        });
    })
        .catch(err => {
            console.log(err);
                res.status(500).json({
                    error: err
                })
        });
});

router.get('/:productId', (req, res, next) => {
   const id = req.params.productId;
   Product.findById(id)
       .select('-__v')
       .exec()
       .then(doc => {
           if (doc) {
               res.status(200).json({
                   product: doc,
                   request: {
                       type: 'GET',
                       url: 'http://localhost:3000/products/' + doc._id
                   }
               });
           } else {
               res.status(404).json({
                   message: 'No valid entry found for provided ID'
               });
           }
       })
       .catch(err => {
           console.log(err);
           res.status(500).json({error: err});
       });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})    // used to be remove function but is no longer used in mongodb
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body: { name: 'String', price: 'Number'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;