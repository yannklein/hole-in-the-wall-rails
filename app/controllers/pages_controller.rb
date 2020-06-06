# init barby & magick libraries
require 'barby'
require 'barby/barcode'
require 'barby/barcode/qr_code'
require 'barby/outputter/png_outputter'
require 'rmagick'

class PagesController < ApplicationController

  def home
    @marker_png = create_marker
  end

  def live

  end

  def pattern
    render 'pattern'
  end

  private

  def create_raw_qrcode
    # Produce the hologram live url
    live_url = "#{root_url}/live"
    live_url = live_url.sub("http:", "https:")
    # Create the QR code PGN image
    barcode = Barby::QrCode.new(live_url, level: :q, size: 5)
    Base64.encode64(barcode.to_png(xdim: 5))
  end

  def create_marker
    # Create the marker containing the QR code
    # Load QR Code
    base_marker = Magick::Image.read_inline(create_raw_qrcode)
    base_marker = base_marker[0]

    white_margin = 0.07
    black_margin = 0.2

    base_marker.border!(512 * black_margin, 512 * black_margin, 'black')
    base_marker.border!(512 * white_margin, 512 * white_margin, 'white')

    full_image64 = Base64.encode64(base_marker.to_blob { |attrs| attrs.format = 'PNG' })
    "data:image/png;base64,#{full_image64}"
  end
end
