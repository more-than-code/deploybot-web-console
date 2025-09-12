export type ParamsType = {
	[k: string]: string;
};

export function SubmitViaForm(action: string, method: string, params: ParamsType) {
	const form = document.createElement('form');
	form.method = method;
	form.action = action;

	for (const key in params) {
		if (Object.prototype.hasOwnProperty.call(params, key)) {
			const hiddenField = document.createElement('input');
			hiddenField.type = 'hidden';
			hiddenField.name = key;
			hiddenField.value = params[key];

			form.appendChild(hiddenField);
		}
	}

	document.body.appendChild(form);
	form.submit();
}

export function obj2Arr(obj: Record<string, unknown>): string[] {
	if (!obj) return [];

	return Object.keys(obj).map((key) => `${key}=${obj[key]}`);
}

export function arr2Obj(arr: string[]): Record<string, string> {
	if (!arr || arr.length === 0) return {};

	const obj: Record<string, string> = {};

	arr.forEach((item) => {
		const [key, value] = item.split('=');
		obj[key] = value;
	});

	return obj;
}

export function transformCamelCase<T extends Record<string, unknown>>(data: T): T {
	if (!data) return data;

	for (const key in data) {
		const value = (data as Record<string, unknown>)[key];

		if (isFirstLetterUpperCase(key)) {
			const lowerKey = lowerFirstLetter(key);
			(data as Record<string, unknown>)[lowerKey] = value;

			delete (data as Record<string, unknown>)[key];
		}
	}

	return data;
}

function lowerFirstLetter(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function isFirstLetterUpperCase(str: string): boolean {
	const firstLetter = str.charAt(0);

	return firstLetter === firstLetter.toUpperCase();
}
