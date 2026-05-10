import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useEffect, useState } from "react";
import { ImageDown } from "lucide-react";
import { useUploadImageMutation } from "@/app/store/services/image.service";

import * as zod from "zod";

interface IProp {
  onChangeImage: (...event: any[]) => void;
  value: string | undefined;
}

const RegisterCircleInputClientSchema = zod.object({
  circle_image: zod.any()
});

type RegisterCircleInputClient = zod.infer<
  typeof RegisterCircleInputClientSchema
>;

// Define schema for registerCircleSchemaClient
const registerCircleSchemaClient = RegisterCircleInputClientSchema;

export type { RegisterCircleInputClient, registerCircleSchemaClient };

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files![0];
  const displayUrl = URL.createObjectURL(file);
  return { file, displayUrl };
}

function squareImage(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const size = Math.min(image.width, image.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    (image.width - size) / 2,
    (image.height - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size
  );
  return canvas;
}

export function ImageUploader({ onChangeImage, value }: IProp) {
  const [preview, setPreview] = useState(value?`${import.meta.env.VITE_API_URL+value.substring(1)}`:"");
  const [ImageSubmit, { data }] = useUploadImageMutation();

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const { file, displayUrl } = getImageData(event);
    const img = new Image();
    img.src = displayUrl;

    img.onload = () => {
      const canvas = squareImage(img);
      const squaredImageUrl = canvas.toDataURL();
      setPreview(squaredImageUrl);
    };
    const data = new FormData();
    data.append("file", file);
    ImageSubmit(data);
  }


  useEffect(() => {
    if (data) {
      onChangeImage(data.url);
    }
  }, [data?.id || data]);

  return (
    <div className="cursor-pointer">
      <Avatar className="w-40 h-40 relative rounded-full  border-2 border-border">
        <AvatarImage src={preview} />
        <AvatarFallback className="flex align-middle justify-center  border-2 border-black">
          <ImageDown className=" scale-150 text-black " />
        </AvatarFallback>
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-0">
          <Input
            type="file"
            accept="image/*"
            className="absolute top-0 left-0 right-0 bottom-0 h-full w-full rounded-full cursor-pointer"
            onChange={(event) => {
              handleImageUpload(event);
            }}
          />
        </div>
      </Avatar>
    </div>
  );
}
