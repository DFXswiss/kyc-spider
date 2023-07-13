import React from "react";
import { Button } from "react-native-paper";
import Colors from "../config/Colors";
import AppStyles, { DefaultCursor } from "../styles/AppStyles";

// TODO: use the paper button props?
export const DfxButton = ({ link, loading, disabled, style, ...props }: any) => {
  const isDisabled = loading || disabled;
  return (
    <Button
      loading={loading}
      disabled={isDisabled}
      contentStyle={[props.contentStyle, isDisabled && DefaultCursor]}
      labelStyle={[
        { color: Colors.White },
        link && AppStyles.buttonLink,
        props.mode === "contained" && { color: isDisabled ? Colors.Grey : Colors.Primary },
      ]}
      style={[style, { borderColor: Colors.Primary, backgroundColor: Colors.Primary }]}
      {...props}
    >
      {props.children}
    </Button>
  );
};
