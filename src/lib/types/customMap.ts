export class CustomMap<K, V> extends Map<K, V> {
	constructor(entries?: readonly (readonly [K, V])[] | null) {
		super(entries);
	}

	toJSON(): { [key: string]: V } {
		const json: { [key: string]: V } = {};
		for (const [key, value] of this.entries()) {
			json[String(key)] = value;
		}

		return json;
	}

	static fromJSON<K, V>(json: { [key: string]: V }): CustomMap<K, V> {
		const customMap = new CustomMap<K, V>();
		for (const key in json) {
			customMap.set(key as K, json[key]);
		}

		return customMap;
	}
}
