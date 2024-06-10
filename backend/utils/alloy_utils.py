import json


def get_alloy_data():
    with open("tmp.json") as f:
        data = json.load(f)
    return data


alloy_instance = get_alloy_data()

nodes = set()
edges = []

# get fields
fields = alloy_instance["alloy"]["instance"]["field"]

if "tuple" in fields:
    tuples = fields.get("tuple")
    label = fields.get("label")

    for tuple_item in tuples:
        atoms = tuple_item["atom"]
        source_label = str(atoms[0]["label"])
        target_label = str(atoms[1]["label"])

        # Add nodes to the set
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
            print(tuple_item)
            atoms = tuple_item["atom"]
            source_label = str(atoms[0]["label"])
            target_label = str(atoms[1]["label"])

            # Add nodes to the set
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


print(json.dumps(elements, indent=2))
