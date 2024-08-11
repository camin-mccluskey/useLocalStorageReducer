import { useCallback, useEffect, type Reducer, useReducer } from "react";
import { useLocalStorage } from "usehooks-ts";

type SyncAction<S> = { type: "sync"; payload: S };
type Reducer<S, A> = (state: S, action: A | SyncAction<S>) => S;
export type ReducerMiddlewareFn<S, A> = (
  action: A | SyncAction<S>,
  state?: S,
) => void;

export const useLocalStorageReducer = <S, A extends Object>(
  key: string,
  reducer: Reducer<S, A>,
  initialState: S | (() => S),
  middlewareFns: Array<ReducerMiddlewareFn<S, A>> = [],
  afterwareFns: Array<ReducerMiddlewareFn<S, A>> = [],
  options?: {
    // TODO: may want to provide customer serializer/deserializer here
    initializeWithValue?: boolean;
  },
) => {
  const [savedState, setSavedState] = useLocalStorage<S>(
    key,
    initialState,
    options,
  );

  const localStorageReducer = useCallback(
    (state: S, action: A | SyncAction<S>) => {
      if ("type" in action && action.type === "sync") {
        return action.payload;
      }
      const newState = reducer(state, action as A);
      setSavedState(newState);
      return newState;
    },
    [reducer, setSavedState],
  );

  const [_, dispatch] = useReducerWithMiddleware(
    localStorageReducer,
    savedState,
    middlewareFns,
    afterwareFns,
  );

  // resync the reducer state with savedState
  useEffect(() => {
    dispatch({ type: "sync", payload: savedState });
  }, [savedState, dispatch]);

  return [savedState, dispatch] as const;
};

export const useReducerWithMiddleware = <S, A>(
  // TODO: creae a type like Reducer for this
  reducer: (state: S, action: A | SyncAction<S>) => S,
  initialState: S,
  middlewareFns: Array<ReducerMiddlewareFn<S, A>>,
  afterwareFns: Array<ReducerMiddlewareFn<S, A>>,
) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchWithMiddleware = useCallback(
    (action: A | SyncAction<S>) => {
      middlewareFns.forEach((middlewareFn) => middlewareFn(action, state));
      dispatch(action);
      afterwareFns.forEach((afterwareFn) => afterwareFn(action, state));
    },
    [middlewareFns, afterwareFns, state],
  );

  return [state, dispatchWithMiddleware] as const;
};
