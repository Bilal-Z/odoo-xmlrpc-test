import xmlrpc from 'xmlrpc';
import dotenv from 'dotenv';

dotenv.config();

// const client = xmlrpc.createSecureClient('https://demo.odoo.com/start');

// client.methodCall('start', [], function (error, value) {
// 	console.log(value);
// });

const host = process.env.HOST;
const db = process.env.DB;
const username = process.env.USERNAME;
const apikey = process.env.API_KEY;

const headers = {
	'User-Agent': 'NodeJS XML-RPC Client',
	'Content-Type': 'text/xml',
	Accept: 'text/xml',
	'Accept-Charset': 'UTF8',
	Connection: 'Keep-Alive',
};

const common = xmlrpc.createSecureClient({
	host,
	path: '/xmlrpc/2/common',
	headers,
});

function getServerVersion() {
	return new Promise((resolve, reject) => {
		common.methodCall('version', [], function (error, value) {
			if (value) {
				return resolve(value);
			}
			console.error(error);
			reject(error);
		});
	});
}

function authenticate(): Promise<number> {
	return new Promise((resolve, reject) => {
		common.methodCall(
			'authenticate',
			[db, username, apikey, []],
			function (error, value) {
				if (value) {
					return resolve(value);
				}
				console.error(error);
				reject(error);
			}
		);
	});
}

const models = xmlrpc.createSecureClient({
	host,
	path: '/xmlrpc/2/object',
	headers,
});

function getProducts(
	uid: number,
	options: { [key: string]: any },
	filter?: any[] | undefined
) {
	return new Promise((resolve, reject) => {
		models.methodCall(
			'execute_kw',
			[db, uid, apikey, 'product.product', 'search_read', [[filter]], options],
			function (error, value) {
				if (value) {
					return resolve(value);
				}
				console.error(error);
				reject(error);
			}
		);
	});
}

function getSingleProduct(
	uid: number,
	options: { [key: string]: any },
	filter?: any[] | undefined
): Promise<{ [key: string]: any }> {
	return new Promise((resolve, reject) => {
		models.methodCall(
			'execute_kw',
			[db, uid, apikey, 'product.product', 'search_read', [[filter]], options],
			function (error, value) {
				if (value) {
					return resolve(value[0]);
				}
				console.error(error);
				reject(error);
			}
		);
	});
}

function updateProductQuantity(
	uid: number,
	prodId: number,
	tmplId: any,
	newQty: number
) {
	const pushNewQty = new Promise((resolve, reject) => {
		models.methodCall(
			'execute_kw',
			[
				db,
				uid,
				apikey,
				'stock.change.product.qty',
				'create',
				[
					{
						product_id: prodId,
						new_quantity: newQty,
						product_tmpl_id: tmplId,
					},
				],
			],
			function (error, value) {
				if (value) {
					console.log(value);
					return resolve(value);
				}
				console.error(error);
				reject(error);
			}
		);
	});

	return new Promise((resolve, reject) => {
		models.methodCall(
			'execute_kw',
			[
				db,
				uid,
				apikey,
				'stock.change.product.qty',
				'change_product_qty',
				[[pushNewQty]],
				{
					context: {
						active_id: prodId,
						active_ids: [prodId],
						active_model: 'product.template',
						allowed_company_ids: [1],
						default_product_id: prodId,
						default_product_tmpl_id: prodId,
						default_type: 'product',
						uid: uid,
					},
				},
			],
			function (error, value) {
				if (value) {
					return resolve(value);
				}
				console.error(error);
				reject(error);
			}
		);
	});
}

async function test() {
	const uid = await authenticate();

	// console.log(ver);
	// console.log(uid);

	const product = await getSingleProduct(
		uid,
		{ fields: ['name', 'qty_available', 'product_tmpl_id'] },
		['name', '=', 'Test product']
	);

	// console.log(product);

	const update = await updateProductQuantity(
		uid,
		product.id,
		product.product_tmpl_id[0],
		11
	);

	// console.log(update);
}

test();

// ['id', '=', 343]
