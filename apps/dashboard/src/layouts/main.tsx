import React from 'react';

type Props = {
    children: React.ReactNode;
};

export const MainLayout = (props: Props) => {
    return (
        <>
            <div>{props.children}</div>
        </>
    );
};
