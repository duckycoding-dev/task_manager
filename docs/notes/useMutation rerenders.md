Whenever using useMutation it will always re render the component in which it is defined twice, even if you are not updating some state manually on success for example.

This is because internally react query hooks like useMutation have some state that gets updated: in this case for example the "isPending" state is updated, thus triggering

1. first rerender when it's set to "true"
2. second rerender when the mutation ends and it's set to "false"
