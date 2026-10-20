# AnimeGANv2 model weights

The `.onnx` files in this directory are converted AnimeGANv2 generator weights.

- **Model:** AnimeGANv2 (photo → anime style transfer)
- **Original author:** Asher Chan (TachibanaYoshino)
- **Original project:** https://github.com/TachibanaYoshino/AnimeGANv2
- **ONNX conversion / mirror:** https://huggingface.co/vumichien/AnimeGANv2_Hayao ,
  https://huggingface.co/vumichien/AnimeGANv2_Shinkai ,
  https://huggingface.co/vumichien/AnimeGANv2_Paprika
- **PyTorch port by:** bryandlee (looonng/animegan2)

## Licence

The upstream AnimeGANv2 weights are released by the author for **non-commercial**
purposes (academic research, teaching, scientific publications). The Hugging Face
mirrors are tagged `apache-2.0`, but the model card text of the upstream project
carries the non-commercial clause; treat that clause as governing.

These weights are bundled here for demonstration. If you intend to use this site
commercially, obtain your own licence for the weights or replace them with a
model whose weights you are licensed to use commercially.

## Bundled files

| File | Style | Size |
| --- | --- | --- |
| `AnimeGANv2_Hayao.onnx` | Hayao (Ghibli-like) | ~8.6 MB |
| `AnimeGANv2_Shinkai.onnx` | Shinkai (Makoto Shinkai) | ~8.6 MB |
| `AnimeGANv2_Paprika.onnx` | Paprika (Kon Satoshi) | ~8.6 MB |

## Graph contract

- Input tensor: `generator_input:0`, float32, NCHW, values normalised to `[-1, 1]`
- Output tensor: `generator/G_MODEL/out_layer/Tanh:0`, float32, NCHW, values in `[-1, 1]`
