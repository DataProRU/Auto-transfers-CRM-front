import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { increment } from '../store/slices/counterSlice';

export const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(increment())}>count is {count}</button>
  );
};
