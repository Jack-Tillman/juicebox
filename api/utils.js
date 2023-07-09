const express = require('express');


function requireUser(req, res, next) {
    //if incorrect/no auth token sent in with reqest, send an error. otherwise, proceed
    if (!req.user) {
      next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action"
      });
    }
  
    next();
  }
  
  module.exports = {
    requireUser
  }