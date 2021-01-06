import express from 'express';
import * as middlewares from '../middlewares';

export const router = express.Router();

router.get('/player/:slug', 
	middlewares.ratelimit(12),
	middlewares.slug,
	middlewares.mojang,
	async (req, res, next) => {
		await Promise.all([
			middlewares.player(req, res, () => {}),
			middlewares.status(req, res, () => {}),
			middlewares.guild(req, res, () => {}),
			middlewares.friends(req, res, () => {})
			]);
		res.locals.friends = res.locals.friends.length;
		next();
	},
	middlewares.send);