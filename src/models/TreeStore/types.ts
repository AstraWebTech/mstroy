/** Уникальный идентификатор элемента дерева **/
export type TreeStoreItemId = number | string;

/** Элемент дерева. **/
export interface TreeStoreItem {
    id: TreeStoreItemId;
    parent: TreeStoreItemId | null;
    label: string;
}

/** Данные для частичного обновления элемента дерева. **/
export interface UpdateTreeStoreItem {
    id: TreeStoreItemId;
    parent?: TreeStoreItemId | null;
    label?: string;
}

/** Методы для работы с древовидным хранилищем. **/
export interface TreeStoreMethods {
    /** Возвращает все элементы дерева в исходном порядке. **/
    getAll(): TreeStoreItem[];

    /**
     * Возвращает элемент по его идентификатору.
     * @throws Ошибка, если элемент не найден.
     */
    getItem(id: TreeStoreItemId): TreeStoreItem;

    /**
     * Возвращает прямых детей указанного элемента.
     * Если детей нет — возвращает пустой массив.
     */
    getChildren(id: TreeStoreItemId): TreeStoreItem[];

    /**
     * Возвращает всех потомков указанного элемента (включая внуки, правнуков и т.д.).
     * Результат включает элементы всех уровней вложенности.
     */
    getAllChildren(id: TreeStoreItemId): TreeStoreItem[];

    /**
     * Возвращает цепочку родителей от указанного элемента до корня.
     * Первый элемент в массиве — сам запрошенный, последний — корневой.
     */
    getAllParents(id: TreeStoreItemId): TreeStoreItem[];

    /**
     * Добавляет новый элемент в дерево.
     * @throws Ошибка, если элемент с таким id уже существует.
     */
    addItem(data: TreeStoreItem): TreeStoreItem;

    /**
     * Удаляет элемент и всё его поддерево (всех потомков).
     * @returns `true`, если элемент был найден и удалён; `false` — если не найден.
     */
    removeItem(id: TreeStoreItemId): boolean;

    /**
     * Обновляет существующий элемент (изменяет label и/или перемещает в другого родителя).
     * @throws Ошибка, если элемент с таким id не существует.
     */
    updateItem(data: UpdateTreeStoreItem): TreeStoreItem;
}
