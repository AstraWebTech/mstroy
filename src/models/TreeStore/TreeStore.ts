import type {TreeStoreItem, TreeStoreItemId, TreeStoreMethods, UpdateTreeStoreItem} from "./types";

export class TreeStore implements TreeStoreMethods{
    private items: TreeStoreItem[];
    private itemMap: Map<TreeStoreItemId, TreeStoreItem>;
    private itemIndexMap: Map<TreeStoreItemId, number>;
    private childrenMap: Map<TreeStoreItemId | null, TreeStoreItem[]>;

    constructor(items: TreeStoreItem[]) {
        this.items = [...items];
        this.itemMap = new Map();
        this.childrenMap = new Map();
        this.itemIndexMap = new Map();

        for (let i = 0; i < items.length; i++) {
            const item: TreeStoreItem = items[i];
            this.itemMap.set(item.id, item);
            this.itemIndexMap.set(item.id, i);
        }

        for (const item of items) {
            if (!this.childrenMap.has(item.parent)) {
                this.childrenMap.set(item.parent, []);
            }
            this.childrenMap.get(item.parent)!.push(item);
        }
    }

    getAll(): TreeStoreItem[]{
        return this.items;
    }

    getItem(id: TreeStoreItemId): TreeStoreItem {
        const item = this.itemMap.get(id);
        if (!item) throw new Error(`Item with id ${id} not found`);
        return item;
    }

    getChildren(id: TreeStoreItemId): TreeStoreItem[] {
        return this.childrenMap.get(id) || [];
    }

    getAllChildren(id: TreeStoreItemId): TreeStoreItem[] {
        const result: TreeStoreItem[] = [];
        const stack = [...(this.childrenMap.get(id) || [])];

        while (stack.length > 0) {
            const current = stack.pop()!;
            result.push(current);
            const children = this.childrenMap.get(current.id);
            if (children && children.length > 0) {
                stack.push(...children);
            }
        }

        return result;
    }

    getAllParents(id: TreeStoreItemId): TreeStoreItem[] {
        const result: TreeStoreItem[] = [];
        let currentId: string | number | null = id;

        while (currentId !== null && this.itemMap.has(currentId)) {
            const item: TreeStoreItem = this.itemMap.get(currentId)!;
            result.push(item);
            currentId = item.parent;
        }

        return result;
    }

    addItem(data: TreeStoreItem): TreeStoreItem {
        if (this.itemMap.has(data.id)) {
            throw new Error(`Item with id ${data.id} already exists`);
        }

        const index = this.items.length;
        this.items.push(data);
        this.itemMap.set(data.id, data);
        this.itemIndexMap.set(data.id, index);

        const parentId = data.parent;
        if (!this.childrenMap.has(parentId)) {
            this.childrenMap.set(parentId, []);
        }
        this.childrenMap.get(parentId)!.push(data);

        return data;
    }

    removeItem(id: TreeStoreItemId): boolean {
        if (!this.itemMap.has(id)) return false;
        const toRemove = new Set<TreeStoreItemId>();
        const stack = [id];

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            if (toRemove.has(currentId)) continue;
            toRemove.add(currentId);

            const children = this.childrenMap.get(currentId);
            if (children) {
                for (const child of children) {
                    stack.push(child.id);
                }
            }
        }

        for (const itemId of toRemove) {
            const item = this.itemMap.get(itemId);
            if (item) {
                const parentChildren = this.childrenMap.get(item.parent);
                if (parentChildren) {
                    const index = parentChildren.findIndex(child => child.id === itemId);
                    if (index !== -1) {
                        parentChildren.splice(index, 1);
                    }
                }
            }
            this.itemMap.delete(itemId);
            this.childrenMap.delete(itemId);
            const itemIndex = this.itemIndexMap.get(itemId);
            if (itemIndex !== undefined) {
                this.items.splice(itemIndex, 1);
                for (let i = itemIndex; i < this.items.length; i++) {
                    this.itemIndexMap.set(this.items[i].id, i);
                }
            }

            this.itemIndexMap.delete(itemId);
        }

        return true;
    }

    updateItem(data: UpdateTreeStoreItem): TreeStoreItem {
        const { id } = data;
        if (!this.itemMap.has(id)) {
            throw new Error(`Item with id ${id} does not exist`);
        }
        const oldItem = this.itemMap.get(id)!;
        const updatedItem: TreeStoreItem = { ...oldItem, ...data };
        if (oldItem.parent !== updatedItem.parent) {
            const oldParentChildren = this.childrenMap.get(oldItem.parent);
            if (oldParentChildren) {
                const index = oldParentChildren.findIndex(item => item.id === id);
                if (index !== -1) oldParentChildren.splice(index, 1);
            }
            if (!this.childrenMap.has(updatedItem.parent)) {
                this.childrenMap.set(updatedItem.parent, []);
            }
            this.childrenMap.get(updatedItem.parent)!.push(updatedItem);
        }
        const itemIndex = this.itemIndexMap.get(id);
        if (itemIndex !== undefined) {
            this.items[itemIndex] = updatedItem;
        }

        this.itemMap.set(id, updatedItem);
        return updatedItem;
    }
}
