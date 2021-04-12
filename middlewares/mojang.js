import { memjsClient } from '../utils/caches';
import { getMojang } from '../utils/requests';

export async function mojang(req, res, next) {
	const slug = res.locals.slug;
	
	// Get the value from the cache
	const mc = memjsClient('NAME');
	const cachedValue = await mc.get(slug);
	mc.close();
	if (cachedValue !== null) {
		res.locals.mojang = filterMojang(cachedValue);
	}
	
	// If slug is not found in cache, call the Mojang API
	else {
		const mojangResponse = await getMojang(slug);
		if (mojangResponse.ok) {
			const mojangJson = await mojangResponse.json();
			res.locals.mojang = filterMojang(mojangJson);
		}
		else {
			switch (mojangResponse.status) {
				case (400): return res.send({success: false, slug, reason: 'MOJANG_CALL_FAILED'});
				case (404): return res.send({success: false, slug, reason: 'MOJANG_PLAYER_DNE'});
				case (429): return res.send({success: false, slug, reason: 'MOJANG_RATELIMITED'});
				default:    return res.send({success: false, slug, reason: 'UNKNOWN'});
			}
		}
	}

	next();
}

function filterMojang(json) {
	const filtered = {};
	['username', 'uuid'].forEach(n => {filtered[n] = json[n]});
	return filtered;
}