import { describe, beforeEach, it, expect } from 'vitest';
import { TreeStore } from './TreeStore';

describe('TreeStore', () => {
    let items: ReturnType<TreeStore['getAll']>;
    let treeStore: TreeStore;

    beforeEach(() => {
        items = [
            { id: 1, parent: null, label: 'Root' },
            { id: 2, parent: 1, label: 'Child 1' },
            { id: 3, parent: 1, label: 'Child 2' },
            { id: 4, parent: 2, label: 'Grandchild 1' },
            { id: 5, parent: 2, label: 'Grandchild 2' },
            { id: 6, parent: 4, label: 'Great-grandchild' },
            { id: 'a', parent: null, label: 'Another Root' }, // string ID
            { id: 'b', parent: 'a', label: 'Child of Another Root' },
        ];
        treeStore = new TreeStore(items);
    });

    describe('getAll', () => {
        it('should return a copy of the initial items array', () => {
            const result = treeStore.getAll();
            expect(result).toEqual(items);
            expect(result).not.toBe(items);
        });
    });

    describe('getItem', () => {
        it('should return item by numeric id', () => {
            const item = treeStore.getItem(1);
            expect(item).toEqual({ id: 1, parent: null, label: 'Root' });
        });

        it('should return item by string id', () => {
            const item = treeStore.getItem('a');
            expect(item).toEqual({ id: 'a', parent: null, label: 'Another Root' });
        });

        it('should throw error if item not found', () => {
            expect(() => treeStore.getItem(999)).toThrow('Item with id 999 not found');
            expect(() => treeStore.getItem('missing')).toThrow('Item with id missing not found');
        });
    });

    describe('getChildren', () => {
        it('should return direct children of root', () => {
            const children = treeStore.getChildren(1);
            expect(children).toEqual([
                { id: 2, parent: 1, label: 'Child 1' },
                { id: 3, parent: 1, label: 'Child 2' },
            ]);
        });

        it('should return empty array for leaf node', () => {
            const children = treeStore.getChildren(3);
            expect(children).toEqual([]);
        });

        it('should work with string id', () => {
            const children = treeStore.getChildren('a');
            expect(children).toEqual([{ id: 'b', parent: 'a', label: 'Child of Another Root' }]);
        });

        it('should return empty array for non-existent parent', () => {
            const children = treeStore.getChildren(999);
            expect(children).toEqual([]);
        });
    });

    describe('getAllChildren', () => {
        it('should return all descendants of root', () => {
            const allChildren = treeStore.getAllChildren(1);
            expect(allChildren).toHaveLength(5);
            const ids = allChildren.map(i => i.id).sort();
            expect(ids).toEqual([2, 3, 4, 5, 6].sort());
        });

        it('should return all descendants of intermediate node', () => {
            const allChildren = treeStore.getAllChildren(2);
            const ids = allChildren.map(i => i.id).sort();
            expect(ids).toEqual([4, 5, 6].sort());
        });

        it('should return empty array for leaf node', () => {
            const allChildren = treeStore.getAllChildren(3);
            expect(allChildren).toEqual([]);
        });

        it('should work with string id', () => {
            const allChildren = treeStore.getAllChildren('a');
            expect(allChildren).toEqual([{ id: 'b', parent: 'a', label: 'Child of Another Root' }]);
        });
    });

    describe('getAllParents', () => {
        it('should return path from leaf to root', () => {
            const parents = treeStore.getAllParents(6);
            expect(parents).toEqual([
                { id: 6, parent: 4, label: 'Great-grandchild' },
                { id: 4, parent: 2, label: 'Grandchild 1' },
                { id: 2, parent: 1, label: 'Child 1' },
                { id: 1, parent: null, label: 'Root' },
            ]);
        });

        it('should return single item for root', () => {
            const parents = treeStore.getAllParents(1);
            expect(parents).toEqual([{ id: 1, parent: null, label: 'Root' }]);
        });

        it('should work with string id', () => {
            const parents = treeStore.getAllParents('b');
            expect(parents).toEqual([
                { id: 'b', parent: 'a', label: 'Child of Another Root' },
                { id: 'a', parent: null, label: 'Another Root' },
            ]);
        });

        it('should stop at root (parent = null)', () => {
            const parents = treeStore.getAllParents(1);
            expect(parents[0].parent).toBeNull();
            expect(parents).toHaveLength(1);
        });
    });

    describe('addItem', () => {
        it('should add new item and update internal structures', () => {
            const newItem = { id: 7, parent: 3, label: 'New Child' };
            treeStore.addItem(newItem);

            expect(treeStore.getItem(7)).toEqual(newItem);
            expect(treeStore.getChildren(3)).toContainEqual(newItem);
            expect(treeStore.getAll()).toContainEqual(newItem);
        });

        it('should throw if item with same id already exists', () => {
            expect(() => treeStore.addItem({ id: 1, parent: null, label: 'Dup' }))
                .toThrow('Item with id 1 already exists');
        });

        it('should support adding to root (parent = null)', () => {
            const newItem = { id: 8, parent: null, label: 'New Root' };
            treeStore.addItem(newItem);
            expect(treeStore.getChildren(null)).toContainEqual(newItem);
        });
    });

    describe('removeItem', () => {
        it('should remove item and all its descendants', () => {
            const removed = treeStore.removeItem(2);
            expect(removed).toBe(true);

            expect(() => treeStore.getItem(2)).toThrow();
            expect(() => treeStore.getItem(4)).toThrow();
            expect(() => treeStore.getItem(6)).toThrow();

            expect(treeStore.getItem(3)).toBeDefined();
        });

        it('should return false if item does not exist', () => {
            const removed = treeStore.removeItem(999);
            expect(removed).toBe(false);
        });

        it('should work with string id', () => {
            const removed = treeStore.removeItem('a');
            expect(removed).toBe(true);
            expect(() => treeStore.getItem('a')).toThrow();
            expect(() => treeStore.getItem('b')).toThrow();
        });

        it('should remove root and all its children', () => {
            treeStore.removeItem(1);
            expect(() => treeStore.getItem(1)).toThrow();
            expect(() => treeStore.getItem(2)).toThrow();
            expect(treeStore.getItem('a')).toBeDefined();
        });
    });

    describe('updateItem', () => {
        it('should update label of existing item', () => {
            treeStore.updateItem({ id: 1, label: 'Updated Root' });
            expect(treeStore.getItem(1).label).toBe('Updated Root');
        });

        it('should move item to new parent', () => {
            treeStore.updateItem({ id: 3, parent: 2 });

            expect(treeStore.getChildren(1).map(i => i.id)).not.toContain(3);
            expect(treeStore.getChildren(2).map(i => i.id)).toContain(3);
        });

        it('should throw if updating non-existent item', () => {
            expect(() => treeStore.updateItem({ id: 999, label: 'Nope' }))
                .toThrow('Item with id 999 does not exist');
        });

        it('should support moving to root (parent = null)', () => {
            treeStore.updateItem({ id: 2, parent: null });
            expect(treeStore.getChildren(null).map(i => i.id)).toContain(2);
        });
    });
});
