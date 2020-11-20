const express = require('express');
const router = require('express').Router();
const Recipes = require('./recipes-model.js');
const Instructions = require('./instructions-model.js');
const Ingredients = require('./ingredients-model.js');

router.use(express.json());

const validateId = require('../middleware/validateRecipeById.js');

// GET - All recipes
router.get('/', (req, res) => {
  Recipes.find()
    .then((recipes) => {
      res.status(200).json({ data: recipes });
    })
    .catch((err) =>
      res.status(500).json({ message: 'Failed to get recipe list.' })
    );
});

// GET - A recipe by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  Recipes.findById(id).then((recipe) => {
    if (recipe) {
      res.status(200).json({ data: recipe });
    } else {
      res
        .status(404)
        .json({ message: 'Could not find a recipe with that id.' });
    }
  });
});

// GET - A recipe's ingredients by ID
router.get('/:id/ingredients', (req, res) => {
  const { id } = req.params;

  Ingredients.findByRecipe(id)
    .then((ingredients) => {
      res.status(200).json({ data: ingredients });
    })
    .catch((err) =>
      res.status(404).json({ message: 'There is no recipe with that ID.' })
    );
});

// GET - A recipe's instructions by ID
router.get('/:id/instructions', (req, res) => {
  const { id } = req.params;

  Instructions.findByRecipe(id)
    .then((instructions) => {
      res.status(200).json({ data: instructions });
    })
    .catch((err) =>
      res.status(404).json({ message: 'There is no recipe with that ID.' })
    );
});

// POST - A new recipe
router.post('/', (req, res) => {
  const recipeData = req.body;
  recipeData.user_id = req.jwt.subject;
  Recipes.add(recipeData)
    .then((recipe) => {
      res.status(201).json({ data: recipe });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to create a new recipe.' });
    });
});

// POST - Ingredients to a recipe by ID
router.post('/:id/ingredients', validateId, (req, res) => {
  const { id } = req.params;

  const ingArray = req.body.ingredients;
  console.log(ingArray);

  Promise.all(
    ingArray.map(async (ingredient) => {
      return await Ingredients.add({ ingredient, recipe_id: id });
    })
  )
    .then((ingredients) => {
      res.status(201).json({ data: ingredients });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

// POST - Instructions to a recipe by ID
router.post('/:id/instructions', validateId, (req, res) => {
  const { id } = req.params;

  const ingArray = req.body.instructions;

  Promise.all(
    ingArray.map(async (instruction) => {
      return await Instructions.add({ instruction, recipe_id: id });
    })
  )
    .then((instructions) => {
      res.status(201).json({ data: instructions });
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

// PUT - Update a recipe by ID
router.put('/:id', validateId, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  Recipes.findById(id)
    .then((recipe) => {
      if (recipe) {
        Recipes.update(changes, id).then((updatedRecipe) => {
          res.status(200).json({ data: updatedRecipe });
        });
      } else {
        res.status(404)({ message: 'There is no recipe with that ID.' });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to update the recipe.' });
    });
});

// PUT - Update an ingredient by ID
router.put('/:id/ingredients', validateId, (req, res) => {
  const changes = req.body;
  id = changes.id;

  Ingredients.findByRecipe(id)
    .then((ingredient) => {
      if (ingredient) {
        Ingredients.update(id, changes).then((updatedIngredient) => {
          res.status(200).json({ data: updatedIngredient });
        });
      } else {
        res.status(404)({ message: 'There is no ingredient with that ID.' });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to update the ingredient.' });
    });
});

// PUT - Update an instruction by ID
router.put('/:id/instructions', validateId, (req, res) => {
  const { id } = req.body.id;
  const changes = req.body;
  console.log(changes, id);

  Instructions.findByRecipe(id)
    .then((instruction) => {
      if (instruction) {
        Instructions.update(id, changes).then((updatedInstruction) => {
          res.status(200).json({ data: updatedInstruction });
        });
      } else {
        res.status(404)({ message: 'There is no instruction with that ID.' });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to update the instruction.' });
    });
});

// DELETE - A recipe by ID
router.delete('/:id', validateId, (req, res) => {
  Recipes.remove(req.params.id)
    .then((count) => {
      if (count) {
        res.status(204).json({ message: 'This recipe has been deleted.' });
      } else {
        res
          .status(404)
          .json({ message: 'Could not find a recipe with that id.' });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: 'Failed to delete recipe' });
    });
});

module.exports = router;