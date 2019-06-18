import * as R from 'ramda';
import { useState } from 'react';

const useAsyncJob = <TParams, TData, TError>({
  auto = false,
  asyncJob,
  initVariable,
}: {
  auto?: boolean;
  asyncJob: (
    variables: TParams,
  ) => Promise<{
    data?: TData;
    error?: TError;
    ok: boolean;
  }>;
  initVariable?: TParams;
}) => {
  type State = {
    error: null | TError;
    data: null | TData;
    executing: boolean;
    reexecuting: boolean;
    executed: boolean;
  };

  const [
    { error, data, executing, reexecuting, executed },
    setState,
  ] = useState<State>({
    error: null,
    data: null,
    executing: false,
    reexecuting: false,
    executed: false,
  });

  const executeAsyncJob = async (variable: TParams) => {
    setState(
      R.evolve({
        executing: executed ? R.F : R.T,
        reexecuting: executed ? R.T : R.F,
      }),
    );

    let asyncJobError;
    let asyncJobData;
    const asyncJobResult = await asyncJob(variable);

    if (asyncJobResult) {
      asyncJobData = asyncJobResult.data;
      asyncJobError = asyncJobResult.error;

      if (asyncJobData && asyncJobError) {
        throw new Error(
          'Some of your async job returned both "data" and "error" fields. An async job is either successful or failed.',
        );
      }

      setState(R.evolve({
        data: asyncJobData ? R.always(asyncJobData) : R.always(null),
        error: asyncJobError ? R.always(asyncJobError) : R.always(null),
        executing: R.F,
        reexecuting: R.F,
        executed: R.T,
      }) as any);
    }

    return {
      ok: !!asyncJobData,
      ...asyncJobResult,
    };
  };

  if (auto && !executed && !executing) {
    executeAsyncJob(initVariable as any);
  }

  return {
    error,
    data,
    executing,
    reexecuting,
    executed,
    executeAsyncJob,
  };
};

export default useAsyncJob;
