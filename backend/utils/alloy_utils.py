import json

def get_graph_data(alloy_instance: json):
  nodes = set()
  edges = []

  def get_atoms_from_sig(d):
    def search_nested_dict(d):
      if isinstance(d, dict):
        for k, v in d.items():
          if k == 'atom':
            if isinstance(v, list):
              for item in v:
                if 'label' in item:
                  nodes.add(str(item['label']).replace('$', ''))
            elif 'label' in v:
              nodes.add(str(v['label']).replace('$', ''))
          elif isinstance(v, dict) or isinstance(v, list):
            search_nested_dict(v)
      elif isinstance(d, list):
        for i in d:
          search_nested_dict(i)
    search_nested_dict(d)

  if 'sig' in alloy_instance["alloy"]["instance"]:
    get_atoms_from_sig(alloy_instance["alloy"]["instance"]["sig"])
  
  def process_field(field):
    relation = field.get('label')
    tuple_field = field.get('tuple', {})
    if isinstance(tuple_field, dict):
        tuples = [tuple_field]
    else:
        tuples = tuple_field
    for t in tuples:
        if isinstance(t, dict):
            atoms = t.get('atom', [])
            if len(atoms) >= 2:
                source_label = atoms[0].get('label')
                target_label = atoms[1].get('label')
                print(source_label, target_label)
                if source_label and target_label:
                    nodes.add(source_label.replace('$', ''))
                    nodes.add(target_label.replace('$', ''))
                    edges.append(
                        {
                            "data": {
                                "id": f"{source_label}_{target_label}",
                                "label": relation,
                                "source": source_label.replace('$', ''),
                                "target": target_label.replace('$', ''),
                                "relationship": relation,
                            }
                        }
                    )
        elif isinstance(t, list):
            for atom in t:
                if isinstance(atom, dict):
                    source_label = atom.get('label')
                    print(source_label)
                    if source_label:
                        nodes.add(source_label.replace('$', ''))

  if 'field' in alloy_instance["alloy"]["instance"]:
      fields = alloy_instance["alloy"]["instance"]["field"]
      if isinstance(fields, list):
        for field in fields:
          process_field(field)
      else:
        process_field(fields)
  # else:
  #     for instance in alloy_instance["alloy"]["instance"]:
  #       fields = instance["field"]
  #       if isinstance(fields, list):
  #         for field in fields:
  #           process_field(field)
  #       else:
  #         process_field(fields)
  print(nodes)
  print(edges)
  node_list = [{"data": {"id": node, "label": node}} for node in nodes]
  elements = node_list + edges
  specId = alloy_instance["specId"]
  return json.dumps({"elements": elements, "specId": specId})