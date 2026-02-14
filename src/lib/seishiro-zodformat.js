function ErrorZodContext(strError) {
  const [msg, ...paramsMsg] = String(strError || "")
    ?.trim()
    ?.split("|");
  let KeyMessage = {};
  for (let lineMsg of paramsMsg) {
    const [keyMsg, valueMsg] = String(lineMsg).split(":");
    KeyMessage[keyMsg] = valueMsg;
  }
  return {
    error: msg,
    error_params: KeyMessage,
  };
}

export default function SeishiroZodFormat(
  zodObject,
  data = {},
  schemaProtocol = "",
) {
  const dataInfo = zodObject.safeParse(data);
  if (dataInfo.success) {
    return null;
  }
  const dataError = dataInfo.error.issues.map((a) =>
    ErrorZodContext(a.message),
  );
  const dataReturn = dataError.map((a) => a.error_params);
  return {
    error: `${schemaProtocol}:${dataError.map((a) => String(a.error).trim()).join("|")}`,
    params: dataReturn,
  };
}
