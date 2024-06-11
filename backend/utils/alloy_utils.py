import json

def get_graph_data(alloy_instance: json):
  nodes = set()
  edges = []

  # get fields
  if "field" not in alloy_instance["alloy"]["instance"]:
    sigs = alloy_instance["alloy"]["instance"]["sig"]
    for sig in sigs:
      if 'this/' in sig['label']:
        print(sig)
  else:
    fields = alloy_instance["alloy"]["instance"]["field"]
    if "tuple" in fields:
      tuples = fields.get("tuple")
      label = fields.get("label")
      for tuple_item in tuples:
        atoms = tuple_item["atom"]
        source_label = str(atoms[0]["label"]).replace('$', '')
        target_label = str(atoms[1]["label"]).replace('$', '')
        nodes.add(source_label)
        nodes.add(target_label)
        edges.append(
          {
            "data": {
              "id": f"{source_label}_{target_label}",
              "label": label,
              "source": source_label,
              "target": target_label,
              "relationship": label,
            }
          }
        )
    else:
      for field in fields:
        tuples = field.get("tuple")
        label = field.get("label")
        if field.get("tuple") is None:
          continue
        for tuple_item in tuples:
          atoms = tuple_item["atom"]
          source_label = str(atoms[0]["label"]).replace('$', '')
          target_label = str(atoms[1]["label"]).replace('$', '')
          nodes.add(source_label)
          nodes.add(target_label)
          edges.append(
            {
              "data": {
                "id": f"{source_label}_{target_label}",
                "label": label,
                "source": source_label,
                "target": target_label,
                "relationship": label,
              }
            }
          )
  
  node_list = [{"data": {"id": node, "label": node}} for node in nodes]
  elements = node_list + edges

  specId = alloy_instance["specId"]

  return json.dumps({"elements": elements, "specId": specId})


def get_alloy_data():
    with open("0.json") as f:
        data = json.load(f)
    return data


alloy_instance = get_alloy_data()
print(get_graph_data(alloy_instance))
