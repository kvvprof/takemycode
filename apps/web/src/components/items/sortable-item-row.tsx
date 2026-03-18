import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableItemRowProps = {
  id: number;
  unselectBusy: boolean;
  listBlocked: boolean;
  onUnselect: (id: number) => Promise<void>;
};

export const SortableItemRow = ({
  id,
  unselectBusy,
  listBlocked,
  onUnselect,
}: SortableItemRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: listBlocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={[
        'items-panel__item',
        isDragging ? 'items-panel__item--dragging' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className='items-panel__item-id'>{id}</div>
      <div className='items-panel__item-action'>
        <button
          className='items-panel__button items-panel__button--remove'
          disabled={unselectBusy || listBlocked}
          onClick={() => void onUnselect(id)}
          type='button'
        >
          Убрать
        </button>
      </div>
    </div>
  );
};
